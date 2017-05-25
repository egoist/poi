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
  if (mode === 'production' && homepage) {
    return /\/$/.test(homepage) ? homepage : (homepage + '/')
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
    static: useHash ? 'static/media/[name].[hash:8].[ext]' : 'static/media/[name].[ext]',
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

exports.parsePresets = presets => {
  const loadPreset = (name, options) => {
    if (typeof name === 'string') {
      let preset
      try {
        preset = /^(\.|\/)/.test(name) ? name : `poi-preset-${name}`
        name = require(path.join(process.cwd(), preset))
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND' && err.message.indexOf(name) > -1) {
          throw new AppError(`Cannot find module "${preset}" in current working directory!\n\nYou may need to run: yarn add ${preset} --dev`)
        } else {
          throw err
        }
      }
    }
    if (typeof name === 'function') {
      name = name(options)
    }
    return name
  }

  presets = Array.isArray(presets) ?
    presets :
    typeof presets === 'object' ?
    Object.keys(presets).map(name => [name, presets[name]]) :
    [presets]

  return presets.map(preset => {
    if (typeof preset === 'string') {
      preset = loadPreset(preset)
    } else if (Array.isArray(preset)) {
      preset = loadPreset(preset[0], preset[1])
    }

    return preset
  })
}
