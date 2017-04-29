const fs = require('fs')
const path = require('path')
const chalk = require('chalk')
const tildify = require('tildify')
const AppError = require('./app-error')

exports.cwd = function (cwd, ...args) {
  return path.resolve(cwd || process.cwd(), ...args)
}

exports.ownDir = function (...args) {
  return path.join(__dirname, '../', ...args)
}

exports.getConfigFile = function (config) {
  return exports.cwd(typeof config === 'string' ? config : 'poi.config.js')
}

exports.getPublicPath = function (mode, homepage) {
  if (mode === 'production' && homepage) {
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

exports.inferHTML = function (options) {
  const minimize = exports.inferProductionValue(options.minimize, options.mode)

  const result = {
    title: 'Poi App',
    template: exports.ownDir('lib/index.ejs'),
    minify: {
      collapseWhitespace: minimize,
      minifyCSS: minimize,
      minifyJS: minimize
    }
  }

  const pkg = exports.readPkg()
  result.pkg = pkg
  result.title = pkg.productName || pkg.name
  result.description = pkg.description

  const templatePath = path.resolve(options.cwd || process.cwd(), 'index.ejs')
  if (fs.existsSync(templatePath)) {
    console.log(`> Using external HTML template file`)
    console.log(chalk.dim(`> location: "${tildify(templatePath)}"`))
    result.template = templatePath
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

exports.inferProductionValue = function (value, mode) {
  if (typeof value !== 'undefined') {
    return value
  }
  return mode === 'production'
}

exports.promisify = function (fn) {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) return reject(err)
        resolve(result)
      })
    })
  }
}

exports.stringifyObject = function (obj) {
  return Object.keys(obj).reduce((curr, next) => {
    curr[next] = JSON.stringify(obj[next])
    return curr
  }, {})
}
