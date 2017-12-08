const UseConfig = require('use-config')

module.exports = function ({
  config,
  cwd = process.cwd(),
  name = 'poi'
} = {}) {
  const enforceConfig = typeof config === 'string'
  const files = enforceConfig ? [config] : ['{name}.config.js', 'package.json']

  const useConfig = new UseConfig({
    name,
    files,
    cwd
  })

  return useConfig.load()
}
