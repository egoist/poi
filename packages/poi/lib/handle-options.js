const co = require('co')
const chalk = require('chalk')
const LoadExternalConfig = require('poi-load-config')
const tildify = require('tildify')
const buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain')

const { inferHTML, readPkg } = require('./utils')

module.exports = co.wrap(function * (options) {
  const loadExternalConfig = new LoadExternalConfig({ cwd: options.cwd })

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
      console.log('> Using extenal postcss configuration')
      console.log(chalk.dim(`> location: "${tildify(postcssConfig.file)}"`))
      options.postcss = postcssConfig
    }
  }

  if (options.html === undefined) {
    console.log(`> Using inferred value from package.json for HTML file`)
    options.html = inferHTML(options)
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
