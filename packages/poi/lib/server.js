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

  // Refresh browser when html file changes
  // Basically this works like `watchContentBase` in webpack-dev-server
  // https://github.com/webpack/webpack-dev-server/blob/fd3c176d9a84c0e5e6d0ad579910ab0dccd3fe42/lib/Server.js#L666-L689
  compiler.plugin('compilation', compilation => {
    compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
      server.sockWrite(server.sockets, 'content-changed')
      cb()
    })
  })

  return {
    server,
    host,
    port
  }
}
