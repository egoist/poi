const path = require('path')

module.exports = (config, { config: babelConfig, include }) => {
  // Ensure that include is an array
  if (typeof include === 'string') {
    include = [include]
  }

  config.module
    .rule('js')
    .test(/\.jsx?$/)
    .include.add(filepath => {
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
    })
    .end()
    .use('babel-loader')
    .loader(require.resolve('babel-loader'))
    .options(babelConfig)
}
