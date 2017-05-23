const UseConfig = require('use-config')

module.exports = function ({
  config,
  cwd = process.cwd()
} = {}) {
  const enforceConfig = typeof config === 'string'
  const files = enforceConfig ? [config] : ['{name}.config.js', 'package.json']

  const useConfig = new UseConfig({
    files,
    cwd
  })

  return useConfig.load('poi')
}
