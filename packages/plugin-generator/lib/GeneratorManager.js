const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')
const { prompt } = require('inquirer')
const resolveFrom = require('resolve-from')
const deepEqual = require('fast-deep-equal')
const parsePackageName = require('parse-package-name')
const install = require('@poi/cli-utils/install-deps')
const logger = require('@poi/cli-utils/logger')
const icon = require('@poi/cli-utils/icon')
const GeneratorApi = require('./GeneratorAPI')

module.exports = class GeneratorManager {
  constructor(api) {
    this.api = api
    this.generators = new Map()
  }

  registerGenerator(generatorName, generator, pluginName) {
    this.generators.set(
      generatorName,
      Object.assign({}, generator, {
        __plugin: pluginName
      })
    )
    return this
  }

  setGeneratorsFromPlugins() {
    for (const plugin of this.api.plugins) {
      if (plugin.generators) {
        for (const generatorName of Object.keys(plugin.generators)) {
          if (this.generators.has(generatorName)) {
            logger.debug(
              `Generator '${generatorName}' added by plugin '${
                this.generators.get(generatorName).__plugin
              }' has been overrided by plugin '${plugin.name}'`
            )
          }
          this.registerGenerator(
            generatorName,
            plugin.generators[generatorName],
            plugin.name
          )
        }
      }
    }
    return this.generators
  }

  listGeneratorsFromPlugins() {
    const generators = this.setGeneratorsFromPlugins()
    const generatorNames = [...generators.keys()]
    if (generatorNames.length === 0) {
      return console.log(chalk.yellow(`No generators are available.`))
    }
    console.log(
      chalk.bold(
        'Showing all available generators you can invoke\nand how they might affect the file system:\n'
      )
    )
    console.log(
      generatorNames
        .map(name => {
          const { effects } = generators.get(name)
          let res = `${chalk.bold('-')} ${chalk.bold.green(name)}`
          if (effects) {
            res += chalk.dim(
              `\n${[]
                .concat(effects)
                .map(effect => {
                  return `  - ${effect}`
                })
                .join('\n')}`
            )
          }
          return res
        })
        .join('\n')
    )
  }

  async add(name, flags) {
    // @poi/foo => @poi/plugin-foo
    const parsed = parsePackageName(name)
    if (parsed.name.startsWith('@poi/')) {
      parsed.name = parsed.name.replace(/^@poi\/(plugin-)?/, '@poi/plugin-')
    } else {
      parsed.name = parsed.name.replace(/^(poi-plugin-)?/, 'poi-plugin-')
    }
    await install({
      deps: [`${parsed.name}${parsed.version ? `@${parsed.version}` : ''}`],
      saveDev: true,
      cwd: this.api.resolve()
    })
    const { name: pluginName, generators } = require(resolveFrom(
      this.api.resolve(),
      parsed.name
    ))
    if (generators) {
      for (const name of Object.keys(generators)) {
        const generator = generators[name]
        if (generator.invokeAfterAdd) {
          logger.log(
            icon.invoking,
            `Invoking generator '${name}' from plugin '${pluginName}'`
          )
          // eslint-disable-next-line no-await-in-loop
          await this.invoke(generator, flags)
        }
      }
    }
  }

  async invokeFromPlugins(name, flags) {
    const generators = this.setGeneratorsFromPlugins()
    await this.invoke(generators, name, flags)
  }

  async invoke(generators, name, flags) {
    if (!generators.has(name)) {
      return logger.error(`Generator "${name}" does not exist!`)
    }
    const generator = generators.get(name)
    const questions = generator.prompts
    const answers = Object.assign({}, questions && (await prompt(questions)))
    const oldPkgData = JSON.parse(JSON.stringify(this.api.pkg.data))
    const generatorApi = new GeneratorApi({ answers, api: this.api, flags })
    await generator.generate(generatorApi)
    // Update package.json
    if (!deepEqual(this.api.pkg.data, oldPkgData)) {
      generatorApi.changedFiles.add(this.api.pkg.path)
      await fs.writeFile(
        this.api.pkg.path,
        JSON.stringify(this.api.pkg.data, null, 2),
        'utf8'
      )
    }
    // Maybe npm install
    if (!flags.createPoiApp && generator.npmInstall) {
      await install({ cwd: this.api.resolve() })
    }
    if (!flags.createPoiApp) {
      console.log()
      logger.success(`Successfully invoked generator "${chalk.bold(name)}"!`)
    }
    if (!flags.createPoiApp && generatorApi.changedFiles.size > 0) {
      console.log(`\n  Following files are modified by this generator:\n`)
      for (const file of generatorApi.changedFiles) {
        console.log('  ' + chalk.yellow(path.relative(process.cwd(), file)))
      }
      console.log(
        `\n  You should run ${chalk.cyan(
          'git diff'
        )} to review changes and commit them.`
      )
    }
  }
}
