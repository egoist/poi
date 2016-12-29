'use strict'
const path = require('path')
const express = require('express')
const webpack = require('webpack')
const httpProxyMiddleware = require('http-proxy-middleware')
const historyApiFallback = require('connect-history-api-fallback')
const chalk = require('chalk')
const opn = require('opn')

module.exports = function (webpackConfig, options) {
  const app = express()

  const compiler = webpack(webpackConfig)

  const devMiddleWare = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    quiet: true
  })

  app.use(devMiddleWare)

  app.use(require('webpack-hot-middleware')(compiler, {
    log: () => null
  }))

  const mfs = devMiddleWare.fileSystem
  const file = path.join(webpackConfig.output.path, 'index.html')

  if (typeof options.devServer === 'function') {
    options.devServer(app)
  }

  const proxy = options.proxy
  let hpm = null
  if (proxy) {
    checkProxy(proxy)

    hpm = addProxyMiddleware(app, proxy)
  }

  const port = options.port
  const host = options.host
  const url = `http://${host}:${port}`

  devMiddleWare.waitUntilValid(() => {
    console.log(`> Running on ${url}`)
    if (host === '0.0.0.0') {
      console.log(chalk.dim(`To visit it on other device, connect your devices to the same network and open http://${require('internal-ip').v4()}:${port}`))
    }
    if (options.open) {
      opn(url)
    }
  })

  app.get('*', (req, res) => {
    devMiddleWare.waitUntilValid(() => {
      const html = mfs.readFileSync(file)
      res.end(html)
    })
  })

  const appServer = app.listen(port, host)

  if (proxy) {
    // Listen for the websocket 'upgrade' event and upgrade the connection.
    appServer.on('upgrade', hpm.upgrade)
  }

  return app
}

function checkProxy(proxy) {
  if (typeof proxy !== 'string') {
    console.log(chalk.red('When specified, "proxy" must be a string.'))
    console.log(chalk.red(`Instead, the type of "proxy" was "${typeof proxy}".`))
    console.log(chalk.red('Either remove "proxy" from config file, or make it a string.'))
    process.exit(1) // eslint-disable xo/no-process-exit
  }
}

// Custom onError function for httpProxyMiddleware to log custom error messages on the console.
function onProxyError(proxy) {
  return function (err, req, res) {
    const host = req.headers && req.headers.host
    console.log(
      chalk.red('Proxy error:') + ' Could not proxy request ' + chalk.cyan(req.url) +
      ' from ' + chalk.cyan(host) + ' to ' + chalk.cyan(proxy) + '.'
    )
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
      chalk.cyan(err.code) + ').'
    )
    console.log()

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
      res.writeHead(500)
    }
    res.end('Proxy error: Could not proxy request ' + req.url + ' from ' +
      host + ' to ' + proxy + ' (' + err.code + ').'
    )
  }
}

function addProxyMiddleware(devServer, proxy) {
  // if proxy is specified we fallback to index.html if request `accept`s text/html
  // so proxy works with vue-router or other client routing libraries
  devServer.use(historyApiFallback({
    disableDotRule: true,
    htmlAcceptHeaders: ['text/html']
  }))

  // There are a few exceptions which we won't send to the proxy:
  const mayProxy = /^(?!\/(index\.html$|favicon.ico|.*\.hot-update\.json$|sockjs-node\/)).*$/

  // Pass the scope regex both to Express and to the middleware for proxying
  // of both HTTP and WebSockets to work without false positives.
  const hpm = httpProxyMiddleware(pathname => mayProxy.test(pathname), {
    target: proxy,
    logLevel: 'silent',
    onProxyReq(proxyReq) {
      // Browsers may send Origin headers even with same-origin
      // requests. To prevent CORS issues, we have to change
      // the Origin to match the target URL.
      if (proxyReq.getHeader('origin')) {
        proxyReq.setHeader('origin', proxy)
      }
    },
    onError: onProxyError(proxy),
    secure: false,
    changeOrigin: true,
    ws: true
  })

  devServer.use(mayProxy, hpm)

  return hpm
}
