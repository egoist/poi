const path = require('path')
const LoadExternalConfig = require('poi-load-config')
const kebabCase = require('lodash/kebabCase')
const buildConfigChain = require('babel-core/lib/transformation/file/options/build-config-chain')
const logger = require('./logger')
const inferHTML = require('./utils/inferHTML')
const readProjectPkg = require('./utils/readProjectPkg')
const normalizeEntry = require('./utils/normalizeEntry')
const getFilename = require('./utils/getFilename')
const getPublicPath = require('./utils/getPublicPath')
const getHotEntry = require('./utils/getHotEntry')
const getExternals = require('./utils/getExternals')

function getLibraryFilename(component) {
  return kebabCase(
    typeof component === 'string' ? component : path.basename(process.cwd())
  )
}

module.exports = async (options, command) => {
  options = Object.assign(
    {
      entry: 'index.js',
      cwd: process.cwd(),
      vue: {},
      css: {},
      sourceMap:
        command === 'build'
          ? 'source-map'
          : command === 'test' ? 'inline-source-map' : 'eval-source-map',
      hash: command === 'build',
      ...options,
      devServer: {
        host: '0.0.0.0',
        port: 4000,
        ...options.devServer
      }
    },
    options
  )

  options.entry = normalizeEntry(options.entry)
  options.filename = getFilename(options.hash, options.filename)
  options.outDir = path.resolve(options.outDir || 'dist')
  options.publicPath = getPublicPath(command, options.publicPath)
  options.hotReload = options.hotReload !== false && command === 'develop'
  options.hotEntry = getHotEntry(options.hotEntry)
  options.externals = getExternals(options.format).concat(
    options.externals || []
  )
  options.minimize =
    typeof options.minimize === 'boolean'
      ? options.minimize
      : command === 'build'
  options.env = {
    NODE_ENV: command === 'build' ? 'production' : 'development',
    ...options.env
  }

  const loadExternalConfig = new LoadExternalConfig({ cwd: options.cwd })

  // options.component is actually a wrong name
  // god knows why I chose it before...
  const library = options.library || options.component
  if (library) {
    logger.debug('bundling in library mode')
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
    logger.debug('bundle format', options.format)

    options.html = false
    options.sourceMap = false
  }

  if (options.babel === undefined) {
    options.babel = {}
    const externalBabelConfig = await loadExternalConfig.babel(buildConfigChain)

    if (externalBabelConfig) {
      // If root babel config file is found
      // We set `babelrc` to the its path
      // To prevent `babel-loader` from loading it again
      logger.debug('babel config location', externalBabelConfig.loc)
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
    const postcssConfig = await loadExternalConfig.postcss()
    if (postcssConfig.file) {
      logger.debug('postcss config location', postcssConfig.file)

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

  options.css = {
    minimize: options.minimize,
    extract:
      typeof options.css.extract === 'boolean'
        ? options.css.extract
        : command === 'build',
    sourceMap: Boolean(options.sourceMap),
    postcss: options.postcss,
    cssModules: options.css.modules,
    fallbackLoader: 'vue-style-loader',
    filename: options.filename.css
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
    const mainField = readProjectPkg().main
    if (mainField) {
      logger.debug('webpack', 'Using main field in package.json as entry point')
      options.entry = mainField
    }
  }

  return options
}
