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
        if (!filepath.includes(`${path.sep}node_modules${path.sep}`)) {
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
    // Prevent from using loader in cwd
    loader: require.resolve('babel-loader'),
    options: babel
  })
}
