module.exports = (
  config,
  { baseDir, transpileModules, defaultPresetOptions }
) => {
  config.module
    .rule('js')
    .test(/\.jsx?$/)
    .include.add(filepath => {
      if (Array.isArray(transpileModules)) {
        const shouldTranspile = transpileModules.some(condition => {
          condition =
            typeof condition === 'string' ? new RegExp(condition) : condition
          return filepath.match(condition)
        })
        if (shouldTranspile) {
          return true
        }
      }
      // Don't include node_modules
      return !/node_modules/.test(filepath)
    })
    .end()
    .use('babel-loader')
    .loader(require.resolve('../loaders/babel-loader'))
    .options({
      // Options for our custom babel-loader
      // Not used for now
      customLoaderOptions: {
        defaultPresetOptions
      },
      root: baseDir
    })
}
