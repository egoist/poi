module.exports = (config, { baseDir }) => {
  config.module
    .rule('js')
    .test(/\.jsx?$/)
    .include.add(filepath => {
      // Don't include node_modules
      return !/node_modules/.test(filepath)
    })
    .end()
    .use('babel-loader')
    .loader(require.resolve('../loaders/babel-loader'))
    .options({
      // Options for our custom babel-loader
      // Not used for now
      customLoaderOptions: {},
      root: baseDir
    })
}
