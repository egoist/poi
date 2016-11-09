'use strict'
const path = require('path')
const express = require('express')
const webpack = require('webpack')

module.exports = function (webpackConfig, options) {
  const app = express()

  const compiler = webpack(webpackConfig)

  const devMiddleWare = require('webpack-dev-middleware')(compiler, {
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }
  })

  app.use(devMiddleWare)

  app.use(require('webpack-hot-middleware')(compiler))

  const mfs = devMiddleWare.fileSystem
  const file = path.join(webpackConfig.output.path, 'index.html')

  if (typeof options.devServer === 'function') {
    options.devServer(app)
  }

  app.get('*', (req, res) => {
    devMiddleWare.waitUntilValid(() => {
      const html = mfs.readFileSync(file)
      res.end(html)
    })
  })

  return app
}
