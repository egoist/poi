const path = require('path')
const express = require('express')
const proxyMiddleware = require('http-proxy-middleware')

module.exports = function (compiler, devServer = {}) {
  const server = express()

  const port = devServer.port || 4000
  const host = devServer.host || 'localhost'

  const devMiddleWare = require('webpack-dev-middleware')(compiler, {
    quiet: true,
    publicPath: compiler.options.output.publicPath,
    path: `http://${host}:${port}/__webpack_hmr`
  })

  server.use(devMiddleWare)
  server.use(require('webpack-hot-middleware')(compiler, {
    log: () => null
  }))

  if (devServer.setup) {
    devServer.setup(server)
  }

  const mfs = devMiddleWare.fileSystem
  const file = path.join(compiler.options.output.path, 'index.html')

  // proxy api requests
  if (typeof devServer.proxy === 'string') {
    server.use(proxyMiddleware('/api', {
      target: devServer.proxy,
      changeOrigin: true,
      pathRewrite: {
        '^/api': ''
      }
    }))
  } else if (typeof devServer.proxy === 'object') {
    Object.keys(devServer.proxy).forEach(context => {
      let proxyOptions = devServer.proxy[context]
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
