const path = require('path')
const kebabCase = require('lodash/kebabCase')
const findBabelConfig = require('find-babel-config')
const findPostcssConfig = require('postcss-load-config')
const logger = require('@poi/logger')
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

async function handleBabel(options) {
  const { file, config } = await findBabelConfig(process.cwd(), 2)

  if (file) {
    // If root babel config file is found
    // We set `babelrc` to the its path
    // To prevent `babel-loader` from loading it again
    logger.debug('babel config location', file)
    options.config.babelrc = false
    // You can use `babelrc: false` to disable the config file itself
    if (config.babelrc !== false) {
      options.config.extends = file
    }
  } else {
    // If not found
    // We set `babelrc` to `false` for the same reason
    options.config.babelrc = false
  }

  if (!options.config.extends) {
    // Use our default preset when no babelrc was specified
    options.config.presets = [
      [require.resolve('babel-preset-poi'), { jsx: options.jsx }]
    ]
  }

  options.config.cacheDirectory = true

  return options
}

function handleHTML(options) {
  const { html, env, minimize } = options
  if (html === false) return false

  const htmls = Array.isArray(html) ? html : [html || {}]

  const defaultHtmlOption = Object.assign({ env }, inferHTML())

  return htmls.map((h, i) => {
    return Object.assign(
      {
        minify: {
          collapseWhitespace: minimize,
          minifyCSS: minimize,
          minifyJS: minimize
        }
      },
      defaultHtmlOption,
      h
    )
  })
}

module.exports = async (options, command) => {
  options = {
    entry: 'index.js',
    cwd: process.cwd(),
    vue: {},
    css: {},
    hash: command === 'build',
    ...options,
    devServer: {
      host: '0.0.0.0',
      port: 4000,
      ...options.devServer
    },
    babel: {
      jsx: 'react',
      config: {},
      ...options.babel
    }
  }

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
  options.html = handleHTML({
    minimize: options.minimize,
    env: options.env,
    html: options.html
  })
  options.sourceMap =
    options.sourceMap === false || typeof options.sourceMap === 'string'
      ? options.sourceMap
      : command === 'build'
        ? 'source-map'
        : command === 'test' ? 'inline-source-map' : 'eval-source-map'

  const library = options.library
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

  options.babel = await handleBabel(options.babel)

  if (options.postcss === undefined) {
    const postcssConfig = await findPostcssConfig({}, options.cwd, {
      argv: false
    }).catch(err => {
      if (err.message.includes('No PostCSS Config found')) {
        // Return empty options for PostCSS
        return {}
      }
      throw err
    })

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

  if (options.entry === undefined && !options.format) {
    const mainField = readProjectPkg().main
    if (mainField) {
      logger.debug('webpack', 'Using main field in package.json as entry point')
      options.entry = mainField
    }
  }

  return options
}
