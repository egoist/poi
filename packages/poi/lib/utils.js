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

exports.getPublicPath = function (mode, homepage) {
  if (mode === 'production' && typeof homepage === 'string') {
    return (/\/$/.test(homepage) || homepage === '') ? homepage : (homepage + '/')
  }
  return '/'
}

let projectPkgCache

exports.readPkg = function () {
  try {
    projectPkgCache = projectPkgCache || require(exports.cwd('package.json'))
    return projectPkgCache
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      return {}
    }
    throw new AppError(err.message)
  }
}

exports.inferHTML = function (options) {
  const result = {
    title: 'Poi App',
    template: exports.ownDir('lib/index.ejs')
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
    images: 'assets/images/[name].[hash:8].[ext]',
    fonts: useHash ? 'assets/fonts/[name].[hash:8].[ext]' : 'assets/fonts/[name].[ext]',
    chunk: useHash ? '[name].[chunkhash:8].chunk.js' : '[name].chunk.js'
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

exports.createSet = function (value) {
  return Array.isArray(value) ? new Set(value) : new Set([value])
}

exports.unspecifiedAddress = function (host) {
  return host === '0.0.0.0' || host === '::'
}

exports.getFullEnvString = function (env) {
  return Object.keys(env).reduce((res, key) => {
    res[`process.env.${key}`] = env[key]
    return res
  }, {})
}
