const path = require('path')

module.exports = (config, { config: babelConfig, include }) => {
  // Ensure that include is an array
  if (typeof include === 'string') {
    include = [include]
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
        if (Array.isArray(include)) {
          const hasModuleToTransform = include.some(name => {
            return filepath.includes(path.normalize(`/node_modules/${name}/`))
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
    options: babelConfig
  })
}
