const path = require('path')
const express = require('express')
const proxyMiddleware = require('http-proxy-middleware')

module.exports = function (compiler, options) {
  const app = express()

  const devMiddleWare = require('webpack-dev-middleware')(compiler, {
    quiet: true,
    publicPath: compiler.options.output.publicPath,
    path: `http://${options.host}:${options.port}/__webpack_hmr`
  })

  app.use(devMiddleWare)
  app.use(require('webpack-hot-middleware')(compiler, {
    log: () => null
  }))

  if (options.setup) {
    options.setup(app)
  }

  const mfs = devMiddleWare.fileSystem
  const file = path.join(compiler.options.output.path, 'index.html')

  // proxy api requests
  if (typeof options.proxy === 'string') {
    app.use(proxyMiddleware('/api', {
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
      app.use(proxyMiddleware(context, proxyOptions))
    })
  }

  app.use(require('connect-history-api-fallback')({ index: '/' }))

  app.get('/', (req, res) => {
    devMiddleWare.waitUntilValid(() => {
      const html = mfs.readFileSync(file)
      res.end(html)
    })
  })

  return { app, devMiddleWare }
}
