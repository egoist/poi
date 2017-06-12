const path = require('path')
const express = require('express')
const proxyMiddleware = require('http-proxy-middleware')

module.exports = function (compiler, options = {}) {
  const server = express()

  const port = options.port
  const host = options.host

  const devMiddleWare = require('webpack-dev-middleware')(compiler, Object.assign(
    {
      quiet: true,
      publicPath: compiler.options.output.publicPath,
      path: `http://${host}:${port}/__webpack_hmr`
    },
    options.devServer || compiler.options.devServer
  ))

  server.use(devMiddleWare)
  server.use(require('webpack-hot-middleware')(compiler, {
    log: () => null,
    heartbeat: 2500
  }))

  if (options.setupDevServer) {
    options.setupDevServer(server)
  }

  const mfs = devMiddleWare.fileSystem
  const file = path.join(compiler.options.output.path, 'index.html')

  // proxy api requests
  if (typeof options.proxy === 'string') {
    server.use(proxyMiddleware('/api', {
      target: options.proxy,
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    }))
  } else if (typeof options.proxy === 'object') {
    Object.keys(options.proxy).forEach(context => {
      let proxyOptions = options.proxy[context]
      if (typeof proxyOptions === 'string') {
        proxyOptions = {
          target: proxyOptions,
          changeOrigin: true,
          pathRewrite: {
            [`^${context}`]: ''
          }
        }
      }
      server.use(proxyMiddleware(context, proxyOptions))
    })
  }

  server.use(require('connect-history-api-fallback')({ index: '/' }))

  server.get('/', (req, res) => {
    devMiddleWare.waitUntilValid(() => {
      const html = mfs.readFileSync(file)
      res.end(html)
    })
  })

  return { server, devMiddleWare, port, host }
}
