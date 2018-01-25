const path = require('path')

module.exports = (config, { babel, transformModules }) => {
  // Ensure that transformModules is an array
  if (typeof transformModules === 'string') {
    transformModules = [transformModules]
  }

  const jsRule = config.rules.add('js', {
    test: /\.jsx?$/,
    include: [
      filepath => {
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
      }
    ]
  })

  jsRule.loaders.add('babel-loader', {
    loader: 'babel-loader',
    options: babel
  })

  const esRule = config.rules.add('es', {
    test: /\.es6?$/
  })

  esRule.loaders.add('babel-loader', {
    loader: 'babel-loader',
    options: babel
  })
}
