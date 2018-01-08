const UseConfig = require('use-config')

module.exports = function ({
  config,
  cwd = process.cwd(),
  name = 'poi'
} = {}) {
  const enforceConfig = typeof config === 'string'
  const files = enforceConfig ? [config] : ['{name}.config.js', '.{name}rc', 'package.json']

  const useConfig = new UseConfig({
    name,
    files,
    cwd,
    fallbackLoader: filepath => require(filepath)
  })

  useConfig.addLoader({
    test: /\.poirc$/,
    loader(filepath) {
      return this.loadJsonFile(filepath)
    }
  })

  return useConfig.load()
}
