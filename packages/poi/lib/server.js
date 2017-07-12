const Server = require('webpack-dev-server')

module.exports = function (compiler, options) {
  const hot = options.hotReload !== false && options.mode === 'development'

  const devServerOptions = Object.assign({
    hot,
    quiet: true,
    historyApiFallback: true,
    overlay: true,
    noInfo: true,
    disableHostCheck: true,
    publicPath: compiler.options.output.publicPath
  }, compiler.options.devServer, options.devServer)

  if (typeof devServerOptions.proxy === 'string') {
    devServerOptions.proxy = {
      '/api': {
        target: devServerOptions.proxy,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }

  const server = new Server(compiler, devServerOptions)
  const host = options.host
  const port = options.port

  return {
    server,
    host,
    port
  }
}
