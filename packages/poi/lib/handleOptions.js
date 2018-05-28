const path = require('path')
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

async function handleBabel(options) {
  const { file } = await findBabelConfig(process.cwd(), 2)

  if (file) {
    // If root babel config file is found
    // We set `babelrc` to the its path
    // To prevent `babel-loader` from loading it again
    logger.debug('babel config location', file)
  } else {
    // If not found
    // We set `babelrc` to `false` for the same reason
    options.config.babelrc = false
  }

  if (options.config.babelrc === false) {
    // Use our default preset when no babelrc was specified
    options.config.presets = [
      [require.resolve('babel-preset-poi'), { jsx: options.jsx }]
    ]
  }

  options.config.cacheDirectory = true

  return options
}

function handleHTML({ html, minimize, env }) {
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

module.exports = async ({ options, command, env }) => {
  options = Object.assign(
    {
      entry: readProjectPkg().main || 'index.js',
      cwd: process.cwd(),
      vue: {},
      css: {},
      hash: !options.format && command === 'build'
    },
    options
  )

  options.devServer = Object.assign(
    {
      host: options.host || process.env.HOST || '0.0.0.0',
      port: options.port || process.env.PORT || 4000
    },
    options.devServer
  )
  options.babel = Object.assign(
    {
      jsx: 'react',
      config: {}
    },
    options.babel
  )

  options.entry = normalizeEntry(options.entry)
  options.filename = getFilename(options.hash, options.filename)
  options.outDir = path.resolve(options.outDir || 'dist')
  options.publicPath = getPublicPath(command, options.publicPath)
  options.hotReload = options.hotReload !== false && command === 'develop'
  options.hotEntry = getHotEntry(options.hotEntry)
  options.minimize =
    typeof options.minimize === 'boolean'
      ? options.minimize
      : command === 'build'
  options.html =
    options.format || command === 'test'
      ? false
      : handleHTML({
          minimize: options.minimize,
          env,
          html: options.html
        })
  options.sourceMap = options.format
    ? false
    : options.sourceMap === false || typeof options.sourceMap === 'string'
      ? options.sourceMap
      : command === 'build'
        ? 'source-map'
        : command === 'test'
          ? 'inline-source-map'
          : 'eval-source-map'

  options.externals = getExternals(options).concat(options.externals || [])
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

  options.css = {
    minimize: options.minimize,
    isProd: command === 'build',
    extract:
      typeof options.css.extract === 'boolean'
        ? options.css.extract
        : command === 'build',
    sourceMap:
      typeof options.css.sourceMap === 'boolean'
        ? options.css.sourceMap
        : command === 'develop' && Boolean(options.sourceMap), // Only enable CSS sourceMap in dev mode
    postcss: options.postcss,
    cssModules: options.css.modules,
    styleLoader: 'vue-style-loader',
    filename: options.filename.css,
    chunkFilename: options.filename.chunk.replace(/\.js$/, '.css')
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
