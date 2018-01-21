const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const Config = require('webpack-chain')
const merge = require('lodash/merge')
const isCI = require('is-ci')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const PathsCaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin')
const yarnGlobal = require('yarn-global')
const FancyLogPlugin = require('./webpack/fancy-log-plugin')
const TimeFixPlugin = require('./webpack/timefix-plugin')
const webpackUtils = require('./webpack-utils')
const {
  getFileNames,
  getPublicPath,
  ownDir,
  inferProductionValue,
  stringifyObject,
  getFullEnvString
} = require('./utils')
const logger = require('./logger')
const cssLoaders = require('./webpack/css-loaders')
const transformJS = require('./webpack/transform-js')
const transformVue = require('./webpack/transform-vue')

module.exports = function ({
  cwd = process.cwd(),
  entry = './index.js',
  dist,
  homepage,
  format,
  filename,
  mode,
  templateCompiler,
  env,
  define,
  html,
  babel = {},
  postcss = {},
  minimize,
  extractCSS,
  vendor = true,
  sourceMap,
  moduleName,
  cssModules,
  copy,
  hotReload,
  hotEntry,
  vue: vueOptions,
  transformModules,
  hash,
  host,
  port,
  clear,
  inlineImageMaxSize = 10000,
  staticFolder = 'static',
  progress,
  rawErrors
} = {}) {
  const config = new Config()

  const useHash = typeof hash === 'boolean' ? hash : (mode === 'production' && !format)
  filename = getFileNames(useHash, filename)
  minimize = inferProductionValue(minimize, mode)
  extractCSS = inferProductionValue(extractCSS, mode)
  env = stringifyObject(Object.assign({
    NODE_ENV: process.env.NODE_ENV
  }, env))

  if (sourceMap !== false) {
    if (typeof sourceMap === 'string') {
      config.devtool(sourceMap)
    } else {
      sourceMap = mode === 'production' ?
        'source-map' :
        mode === 'test' ?
        'inline-source-map' :
        'eval-source-map'
      config.devtool(sourceMap)
    }
  }

  // Do not resolve path like `:hot:` and `[hot]`
  const handleEntryPath = entry => {
    return /^[[:].+[\]:]$/.test(entry) ? entry : path.resolve(entry)
  }

  if (typeof entry === 'string') {
    config.entry('client').add(handleEntryPath(entry))
  } else if (Array.isArray(entry)) {
    config.entry('client').merge(entry.map(e => handleEntryPath(e)))
  } else if (typeof entry === 'object') {
    Object.keys(entry).forEach(k => {
      const v = entry[k]
      if (Array.isArray(v)) {
        config.entry(k).merge(v.map(e => handleEntryPath(e)))
      } else {
        config.entry(k).add(handleEntryPath(v))
      }
    })
  }

  config.output
    .path(path.resolve(cwd, dist || 'dist'))
    // Add /* filename */ comments to generated require()s in the output.
    .pathinfo(true)
    .filename(filename.js)
    .chunkFilename(filename.chunk)
    .publicPath(getPublicPath(mode, homepage))

  if (mode !== 'production') {
    config.output
      // Point sourcemap entries to original disk location
      .devtoolModuleFilenameTemplate(info => path.resolve(info.absoluteResourcePath))
  }

  config.performance.hints(false)

  config.resolve
    .set('symlinks', true)
    .extensions
      .add('.js')
      .add('.jsx')
      .add('.json')
      .add('.vue')
      .end()
    .modules
      .add(path.resolve(cwd, 'node_modules'))
      .add('node_modules')
      .add(ownDir('node_modules'))
      .end()
    .alias
      .set('@', path.resolve(cwd, 'src'))
      .set('vue$', templateCompiler ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.runtime.esm.js')

  config.resolveLoader
    .set('symlinks', true)
    .modules
      .add(path.resolve(cwd, 'node_modules'))
      .add('node_modules')
      .add(ownDir('node_modules'))

  // Ensure that there's always `plugins` when no config was found
  // To prevent `postcss-loader` from manually searching config file
  if (!postcss.config || !postcss.config.path) {
    postcss.plugins = postcss.plugins || []
  }

  const cssOptions = {
    minimize,
    extract: extractCSS,
    sourceMap: Boolean(sourceMap),
    postcss,
    cssModules,
    fallbackLoader: 'vue-style-loader'
  }

  // Rules for CSS/Stylus/Sass...
  cssLoaders.standalone(config, cssOptions)
  // Rules for JS/JSX/ES6
  transformJS(config, { babel, transformModules })
  // Rules for Vue single-file component
  transformVue(config, { babel, vueOptions, cssOptions })

  config.module
    .rule('image')
      .test([/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/])
      .use('url-loader')
        .loader('url-loader')
        .options({
          name: filename.images,
          // inline the file if < max size
          limit: inlineImageMaxSize
        })
        .end()
      .end()
    // SVG files use file-loader directly, why?
    // See https://github.com/facebookincubator/create-react-app/pull/1180
    .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: filename.images
        })
        .end()
      .end()
    .rule('font')
      .test(/\.(eot|otf|webp|ttf|woff|woff2)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: filename.fonts
        })

  if (mode === 'development' || mode === 'watch') {
    // Fix startTime before all other webpack plugins
    // See https://github.com/webpack/watchpack/issues/25
    config.plugin('timefix')
    .use(TimeFixPlugin)
  }

  // Enforces the entire path of all required modules match
  // The exact case of the actual path on disk
  config.plugin('paths-case-sensitive')
    .use(PathsCaseSensitivePlugin)

  config.plugin('constants')
    .use(webpack.DefinePlugin, [
      merge(
        // { foo: '"foo"' } => { 'process.env.foo': '"foo"' }
        getFullEnvString(env),
        define && stringifyObject(define)
      )
    ])

  config.plugin('fancy-log')
    .use(FancyLogPlugin, [
      {
        mode,
        host,
        port,
        clear,
        rawErrors
      }
    ])

  if (format === 'cjs') {
    config.output.libraryTarget('commonjs2')
    webpackUtils.externalize(config)
  } else if (format === 'umd') {
    config.output.libraryTarget('umd').library(moduleName)
  }

  if (extractCSS) {
    config.plugin('extract-css')
      .use(ExtractTextPlugin, [{
        filename: filename.css,
        allChunks: true
      }])
  }

  if (mode === 'production') {
    const ProgressPlugin = require('webpack/lib/ProgressPlugin')
    const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')

    config.plugin('no-emit-on-errors')
      .use(NoEmitOnErrorsPlugin)

    if (progress !== false && !isCI) {
      config.plugin('progress-bar')
        .use(ProgressPlugin)
    }
  }

  if (minimize) {
    config.plugin('minimize')
      .use(webpack.optimize.UglifyJsPlugin, [{
        sourceMap: Boolean(sourceMap),
        /* eslint-disable camelcase */
        compressor: {
          warnings: false,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true,
          negate_iife: false
        },
        output: {
          comments: false
        }
        /* eslint-enable camelcase */
      }])
  }

  // Do not split vendor code in `cjs` and `umd` mode
  if (vendor && !format && mode !== 'test') {
    config.plugin('split-vendor-code')
      .use(webpack.optimize.CommonsChunkPlugin, [{
        name: 'vendor',
        minChunks: module => {
          return module.context && module.context.indexOf('node_modules') >= 0
        }
      }])
    config.plugin('split-manifest')
      .use(webpack.optimize.CommonsChunkPlugin, [{
        name: 'manifest'
      }])
  }

  if (mode === 'development' || mode === 'watch') {
    const WatchMissingNodeModulesPlugin = require('poi-dev-utils/watch-missing-node-modules-plugin')

    config.plugin('watch-missing-node-modules')
      .use(WatchMissingNodeModulesPlugin, [
        path.resolve(cwd, 'node_modules')
      ])
  }

  const supportHMR = hotReload !== false && mode === 'development'
  const devClient = ownDir('app/dev-client.es6')

  // Add hmr entry (deprecated)
  // Replace keywords like `[hot]` `:hot:` with hmr entry
  // This will be removed in next major version
  config.entryPoints.store.forEach(v => {
    if (v.has('[hot]') || v.has(':hot:')) {
      logger.warn('[hot] keyword is deprecated, use option "hotEntry" instead.')
      logger.warn('See https://poi.js.org/#/options?id=hotentry')
      v.delete('[hot]').delete(':hot:')
      if (supportHMR) {
        v.prepend(devClient)
      }
    }
  })

  // Add hmr entry using `hotEntry` option
  if (supportHMR) {
    config.plugin('hmr')
      .use(webpack.HotModuleReplacementPlugin)

    config.plugin('named-modules')
      .use(webpack.NamedModulesPlugin)

    const hotEntryPoints = webpackUtils.getHotEntryPoints(hotEntry)

    config.entryPoints.store.forEach((v, entryPoint) => {
      if (hotEntryPoints.has(entryPoint)) {
        v.prepend(devClient)
      }
    })
  }

  if (copy !== false) {
    let copyOptions = []
    if (fs.existsSync(path.resolve(cwd, staticFolder))) {
      copyOptions.push({
        from: path.resolve(cwd, staticFolder),
        to: '.',
        ignore: ['.DS_Store', '.gitkeep']
      })
    }
    if (typeof copy === 'object') {
      if (Array.isArray(copy)) {
        copyOptions = copyOptions.concat(copy)
      } else {
        copyOptions.push(copy)
      }
    }
    if (copyOptions.length > 0) {
      config.plugin('copy-static-files')
        .use(CopyPlugin, [copyOptions])
    }
  }

  if (html !== false && mode !== 'test') {
    html = html || {}
    const htmls = Array.isArray(html) ? html : [html]
    const defaultHtml = {
      title: 'Poi',
      template: ownDir('lib/index.ejs'),
      env
    }
    htmls.forEach((h, i) => {
      config.plugin(`html-${i}`)
        .use(HtmlPlugin, [Object.assign({
          minify: {
            collapseWhitespace: minimize,
            minifyCSS: minimize,
            minifyJS: minimize
          }
        }, defaultHtml, h)])
    })
  }

  // installed by `yarn global add`
  if (yarnGlobal.inDirectory(__dirname)) {
    // modules in yarn global node_modules
    // because of yarn's flat node_modules structure
    config.resolve.modules.add(ownDir('..'))
    // loaders in yarn global node_modules
    config.resolveLoader.modules.add(ownDir('..'))
  }

  return config
}
