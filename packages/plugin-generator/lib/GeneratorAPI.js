const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const compileTemplate = require('lodash.template')
const { prompt } = require('inquirer')

module.exports = class GeneratorAPI {
  constructor({ answers, api, flags }) {
    // Prompt answers
    this.answers = answers
    // Plugin API
    this.api = api
    // CLI flags
    this.flags = flags
    // Path to user project's package.json
    this.api.pkg.path = this.api.pkg.path || this.api.resolve('package.json')
    this.pkg = this.api.pkg.data
    // Project name
    this.projectName = this.pkg.name || path.basename(this.api.resolve())

    this.changedFiles = new Set()

    // Bound method context
    this.appendFile = this.appendFile.bind(this)
    this.writeFile = this.writeFile.bind(this)
    this.renderTemplate = this.renderTemplate.bind(this)
    this.copy = this.copy.bind(this)
    this.executeWhenWritable = this.executeWhenWritable.bind(this)
  }

  get pkgPath() {
    return this.api.pkg.path
  }

  set pkgPath(v) {
    throw new Error('You cannot change pkgPath!')
  }

  async appendFile(filename, extra) {
    const filepath = this.api.resolve(filename)
    const content = await fs
      .pathExists(filepath)
      .then(exists => exists && fs.readFile(filepath, 'utf8'))
    if (content && content.includes(extra)) return true
    await fs.writeFile(filepath, content + extra, 'utf8')
    this.changedFiles.add(filepath)
    return this
  }

  async writeFile(filename, content) {
    const outPath = this.api.resolve(filename)
    const res = await this.executeWhenWritable(outPath, () =>
      fs.writeFile(outPath, content, 'utf8')
    )
    if (res) {
      this.changedFiles.add(outPath)
    }
    return res
  }

  async renderTemplate(templatePath, outName, data) {
    const outPath = this.api.resolve(outName)
    const res = await this.executeWhenWritable(outPath, async () => {
      const content = await fs.readFile(templatePath, 'utf8')
      const template = compileTemplate(content)
      const output = template(
        Object.assign({ $pkg: this.pkg }, this.answers, data)
      )
      this.api.logger.debug(chalk.green(`Generated ${outPath}`))
      await fs.ensureDir(path.dirname(outPath))
      await fs.writeFile(outPath, output, 'utf8')
    })
    if (res) {
      this.changedFiles.add(outPath)
    }
    return res
  }

  async copy(fromPath, targetPath) {
    targetPath = this.api.resolve(targetPath)
    const res = await this.executeWhenWritable(targetPath, () =>
      fs.copy(fromPath, targetPath)
    )
    if (res) {
      this.changedFiles.add(targetPath)
    }
    return res
  }

  async executeWhenWritable(filepath, fn) {
    const exists = await fs.pathExists(filepath)
    if (exists) {
      const { overwrite } = await prompt({
        name: 'overwrite',
        type: 'confirm',
        message: `${path.relative(
          process.cwd(),
          filepath
        )} already exists, do you want to overwrite it`,
        default: false
      })
      if (!overwrite && !this.flags.overwrite) {
        this.api.logger.debug(chalk.yellow(`Skipped generating ${filepath}`))
        return false
      }
    }
    await fn()
    return true
  }
}
