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

exports.getPublicPath = function (homepage, dev) {
  if (!dev && homepage) {
    return /\/$/.test(homepage) ? homepage : (homepage + '/')
  }
  return '/'
}

exports.ensureEntry = function (obj) {
  for (const key in obj) {
    if (!Array.isArray(obj[key])) {
      obj[key] = [obj[key]]
    }
  }
  return obj
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
