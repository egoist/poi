const path = require('path')
const glob = require('fast-glob')
const execa = require('execa')
const fs = require('fs-extra')

module.exports = async ({ name = Date.now() } = {}) => {
  const cwd = path.join(__dirname, `.test-projects/poi-${name}`)
  /** @type {string[]} */
  let files

  await fs.remove(cwd)

  const run = async cmd => {
    const [name, ...args] = cmd.split(' ')
    await execa(name, args, { cwd })
    files = await glob(['**/*', '!**/node_modules**'], { cwd })
  }

  return {
    get files() {
      return files.sort()
    },
    run,
    has(file) {
      return files && files.includes(file)
    },
    async write(file, content) {
      await fs.outputFile(path.join(cwd, file), content, 'utf8')
    },
    require(file) {
      return require(path.join(cwd, file))
    }
  }
}
