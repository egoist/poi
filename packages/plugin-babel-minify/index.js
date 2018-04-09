module.exports = (minifyOpts, pluginOpts) => {
  return poi => {
    if (!poi.cli.isCurrentCommand('build')) return

    poi.chainWebpack(config => {
      // Do not use if `minimize` is off
      if (poi.options.minimize) {
        // Always disable webpack's default minimizer
        config.merge({ optimization: { minimize: false } })
        // And use babel-minify plugin instead
        config
          .plugin('minimize')
          .use(require('babel-minify-webpack-plugin'), [minifyOpts, pluginOpts])
      }
    })
  }
}
