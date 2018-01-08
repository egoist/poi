const path = require('path')
const co = require('co')
const chalk = require('chalk')
const LoadExternalConfig = require('poi-load-config')
const tildify = require('tildify')
const kebabCase = require('lodash/kebabCase')
const buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain')

const { inferHTML, readPkg } = require('./utils')

function getLibraryFilename(component) {
  return kebabCase(
    typeof component === 'string' ? component : path.basename(process.cwd())
  )
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
    options.filename = Object.assign(
      {
        js: `${libraryFilename}.js`,
        css: `${libraryFilename}.css`
      },
      options.filename
    )

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
    options.babel = {}
    const externalBabelConfig = yield loadExternalConfig.babel(buildConfigChain)

    if (externalBabelConfig) {
      // If root babel config file is found
      // We set `babelrc` to the its path
      // To prevent `babel-loader` from loading it again
      console.log('> Using external babel configuration')
      console.log(
        chalk.dim(`> location: "${tildify(externalBabelConfig.loc)}"`)
      )
      // You can use `babelrc: false` to disable the config file itself
      if (externalBabelConfig.options.babelrc === false) {
        options.babel.babelrc = false
      } else {
        options.babel.babelrc = externalBabelConfig.loc
      }
    } else {
      // If not found
      // We set `babelrc` to `false` for the same reason
      options.babel.babelrc = false
    }

    if (options.babel.babelrc === false) {
      // Use our default preset when no babelrc was specified
      options.babel.presets = [
        [require.resolve('babel-preset-poi'), { jsx: options.jsx || 'vue' }]
      ]
    }
  }

  if (typeof options.babel === 'object') {
    options.babel.cacheDirectory = true
  }

  if (options.postcss === undefined) {
    const postcssConfig = yield loadExternalConfig.postcss()
    if (postcssConfig.file) {
      console.log('> Using external postcss configuration')
      console.log(chalk.dim(`> location: "${tildify(postcssConfig.file)}"`))

      // Only feed the config path to postcss-loader
      // In order to let postcss-loader ask webpack to watch it
      options.postcss = {
        config: {
          path: postcssConfig.file
        }
      }
    }
  }

  options.postcss = options.postcss || {}
  // Use our postcss config file if no user config file was found
  if (
    (!options.postcss.config || !options.postcss.config.path) &&
    options.autoprefixer !== false
  ) {
    options.postcss = {
      config: {
        path: require.resolve('../app/postcss.config'),
        ctx: {
          autoprefixer: options.autoprefixer,
          config: options.postcss
        }
      }
    }
  }

  const defaultHtmlOption = inferHTML(options)
  if (Array.isArray(options.html)) {
    options.html = options.html.map(v =>
      Object.assign({}, defaultHtmlOption, v)
    )
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

  return options
})
