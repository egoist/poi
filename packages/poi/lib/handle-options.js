const path = require('path')
const co = require('co')
const chalk = require('chalk')
const LoadExternalConfig = require('poi-load-config')
const tildify = require('tildify')
const kebabCase = require('lodash/kebabCase')
const buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain')

const { inferHTML, readPkg } = require('./utils')

function getLibraryFilename(component) {
  return kebabCase(typeof component === 'string' ? component : path.basename(process.cwd()))
}

module.exports = co.wrap(function * (options) {
  const loadExternalConfig = new LoadExternalConfig({ cwd: options.cwd })

  // options.component is actually a wrong name
  // god knows why I chose it before...
  const library = options.library || options.component
  if (library) {
    const format = typeof library === 'string' ? 'UMD' : 'CommonJS'
    console.log(`> Bundling component in ${format} format`)
    const libraryFilename = getLibraryFilename(library)
    options.filename = Object.assign({
      js: `${libraryFilename}.js`,
      css: `${libraryFilename}.css`
    }, options.filename)

    if (typeof library === 'string') {
      options.format = 'umd'
      options.moduleName = library
    } else {
      options.format = 'cjs'
    }

    options.html = false
    options.sourceMap = false
  }

  if (options.babel === undefined) {
    const { useConfig, file } = yield loadExternalConfig.babel(buildConfigChain)
    if (useConfig) {
      console.log('> Using external babel configuration')
      console.log(chalk.dim(`> location: "${tildify(file)}"`))
      options.babel = {
        cacheDirectory: true,
        babelrc: true
      }
    } else {
      options.babel = {
        cacheDirectory: true,
        babelrc: false
      }
    }
    if (options.babel.babelrc === false) {
      // Use our default preset when no babelrc was found
      options.babel.presets = [
        [require.resolve('babel-preset-poi'), { jsx: options.jsx || 'vue' }]
      ]
    }
  }

  if (options.postcss === undefined) {
    const postcssConfig = yield loadExternalConfig.postcss()
    if (postcssConfig.file) {
      console.log('> Using external postcss configuration')
      console.log(chalk.dim(`> location: "${tildify(postcssConfig.file)}"`))
      options.postcss = postcssConfig
    }
  }

  const defaultHtmlOption = inferHTML(options)
  if (Array.isArray(options.html)) {
    options.html = options.html.map(v => Object.assign({}, defaultHtmlOption, v))
  } else if (typeof options.html === 'object') {
    options.html = Object.assign({}, defaultHtmlOption, options.html)
  } else if (typeof options.html === 'undefined') {
    options.html = defaultHtmlOption
  }

  if (options.entry === undefined && !options.format) {
    const mainField = readPkg().main
    if (mainField) {
      console.log(`> Using main field in package.json as entry point`)
      options.entry = mainField
    }
  }

  const { browserslist = ['ie > 8', 'last 2 versions'] } = readPkg()

  if (options.autoprefixer !== false) {
    options.autoprefixer = Object.assign({
      browsers: browserslist
    }, options.autoprefixer)
  }

  return options
})
