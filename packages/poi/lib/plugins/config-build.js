exports.name = 'builtin:config-build'

exports.extend = api => {
  if (!api.isCommand('build')) return

  api.chainWebpack(config => {
    config.merge({
      optimization: {
        minimize: api.config.minimize,
        minimizer: [
          {
            apply(compiler) {
              // eslint-disable-next-line import/no-extraneous-dependencies
              const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
              new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: Boolean(api.config.sourceMap),
                uglifyOptions: {
                  output: {
                    comments: false
                  },
                  mangle: true
                }
              }).apply(compiler)
            }
          }
        ]
      }
    })
  })
}
