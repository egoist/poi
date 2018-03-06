module.exports = (minifyOpts, pluginOpts) => {
  return poi => {
    if (!poi.cli.isCurrentCommand('build')) return

    poi.extendWebpack(config => {
      // Do not use if `minimize` is off
      if (poi.options.minimize) {
        // Always disable webpack's default minimizer
        config.set('optimization.minimize', false)
        // And use babel-minify plugin instead
        config.plugins.add('minimize', require('babel-minify-webpack-plugin'), [
          minifyOpts,
          pluginOpts
        ])
      }
    })
  }
}
