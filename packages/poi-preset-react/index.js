module.exports = () => {
  return poi => {
    const config = poi.webpackConfig

    // Add react plugins to babel config
    config.module.rule('js')
      .use('babel')
      .tap(options => {
        // Remove default vue-app preset
        // When `babelrc` is false, we're using default babel config
        if (options.babelrc === false) {
          options.presets = []
        }
        return poi.merge(options, {
          presets: [
            require.resolve('babel-preset-react-app')
          ],
          plugins: [
            require.resolve('babel-plugin-react-require'),
            require.resolve('react-hot-loader/babel')
          ]
        })
      })

    // Add entry
    if (config.entryPoints.has('client')) {
      config.entry('client').prepend(require.resolve('react-hot-loader/patch'))
    } else {
      throw new Error('Currently only `client` entry is supported')
    }
  }
}
