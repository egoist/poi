const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const AppError = require('./app-error')

exports.cwd = function (...args) {
  return path.resolve(...args)
}

exports.ownDir = function (...args) {
  return path.join(__dirname, '../', ...args)
}

exports.getConfigFile = function (config) {
  return exports.cwd(typeof config === 'string' ? config : 'vbuild.config.js')
}

exports.getPublicPath = function (mode, homepage) {
  if (mode !== 'development' && homepage) {
    return /\/$/.test(homepage) ? homepage : (homepage + '/')
  }
  return '/'
}

exports.readPkg = function () {
  try {
    return require(exports.cwd('package.json'))
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return {}
    }
    throw new AppError(err.message)
  }
}

exports.inferHTML = function ({ minimize }) {
  const result = {
    title: 'VBuild App',
    template: exports.ownDir('lib/index.html'),
    minify: {
      collapseWhitespace: minimize,
      minifyCSS: minimize,
      minifyJS: minimize
    }
  }

  const pkg = exports.readPkg()
  result.pkg = pkg
  // productionName is wrong, will be removed in next major version
  // use productName instead
  result.title = pkg.productName || pkg.productionName || pkg.title || pkg.name
  result.description = pkg.description

  if (fs.existsSync('index.html')) {
    console.log(chalk.bold(`> Using external HTML template file`))
    console.log(chalk.dim(`> location: "./index.html"`))
    result.template = exports.cwd('index.html')
  }

  return result
}

exports.getFileNames = function (useHash, customFileName) {
  return Object.assign({
    js: useHash ? '[name].[chunkhash:8].js' : '[name].js',
    css: useHash ? '[name].[contenthash:8].css' : '[name].css',
    static: useHash ? 'static/[name].[hash:8].[ext]' : 'static/[name].[ext]',
    chunk: useHash ? '[id].[chunkhash:8].chunk.js' : '[id].chunk.js'
  }, customFileName)
}
