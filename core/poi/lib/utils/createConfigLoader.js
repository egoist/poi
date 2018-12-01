const fs = require('fs')
const path = require('path')
const JoyCon = require('joycon').default

const rcLoader = {
  name: 'rc',
  test: /\.[a-z]+rc$/,
  loadSync(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  }
}

module.exports = cwd => {
  const configLoader = new JoyCon({ cwd, stopDir: path.dirname(process.cwd()) })

  configLoader.addLoader(rcLoader)

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
