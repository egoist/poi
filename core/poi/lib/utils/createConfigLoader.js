const fs = require('fs')
const path = require('path')
const Module = require('module')
const colors = require('chalk')
const JoyCon = require('joycon').default
const PoiError = require('./PoiError')

const rcLoader = {
  name: 'rc',
  test: /\.[a-z]+rc$/,
  loadSync(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
}

const tsLoader = {
  name: 'ts',
  test: /\.ts$/,
  loadSync(filePath) {
    if (!Module._extensions['.ts']) {
      throw new PoiError(
        `Found ${path.relative(
          process.cwd(),
          filePath
        )}, try installing ${colors.bold(
          '`ts-node`'
        )} and using CLI flag ${colors.bold(
          '`-r ts-node/register`'
        )} to support .ts config files. If you don't need type checking, use ${colors.bold(
          '`-r ts-node/register/transpile-only`'
        )} instead.`
      )
    }
    const result = require(filePath)
    return result.default || result
  }
}

module.exports = cwd => {
  const configLoader = new JoyCon({ cwd, stopDir: path.dirname(process.cwd()) })

  configLoader.addLoader(rcLoader)
  configLoader.addLoader(tsLoader)

  return {
    load(opts, noCache) {
      if (noCache) {
        configLoader.clearCache()
      }
      return configLoader.loadSync(opts)
    },
    resolve(opts, noCache) {
      if (noCache) {
        configLoader.clearCache()
      }
      return configLoader.resolveSync(opts)
    }
  }
}
