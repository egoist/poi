const path = require('path')

module.exports = (config, { babel, transformModules }) => {
  // Ensure that transformModules is an array
  if (typeof transformModules === 'string') {
    transformModules = [transformModules]
  }

  config.module
    .rule('js')
      .test(/\.jsx?$/)
      .include
      .add(filepath => {
        // For anything outside node_modules
        if (filepath.indexOf(`${path.sep}node_modules${path.sep}`) === -1) {
          return true
        }
        // For specified modules
        if (Array.isArray(transformModules)) {
          const hasModuleToTransform = transformModules.some(name => {
            return filepath.indexOf(`${path.sep}node_modules${path.sep}${name}${path.sep}`) >= 0
          })
          if (hasModuleToTransform) {
            return true
          }
        }
        return false
      })
      .end()
    .use('babel-loader')
      .loader('babel-loader')
      .options(babel)

  config.module
    .rule('es')
      .test(/\.es6?$/)
      .use('babel-loader')
        .loader('babel-loader')
        .options(babel)
}
