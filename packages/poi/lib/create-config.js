const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const Config = require('webpack-chain')
const merge = require('lodash.merge')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const PathsCaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin')
const yarnGlobal = require('yarn-global')
const cssLoaders = require('./css-loaders')
const webpackUtils = require('./webpack-utils')
const {
  getFileNames,
  getPublicPath,
  ownDir,
  inferProductionValue,
  stringifyObject
} = require('./utils')

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
  vendor,
  sourceMap,
  autoprefixer,
  moduleName,
  cssModules,
  copy,
  hotReload,
  hotEntry
} = {}) {
  const config = new Config()

  const useHash = mode === 'production' && !format
  filename = getFileNames(useHash, filename)
  minimize = inferProductionValue(minimize, mode)
  extractCSS = inferProductionValue(extractCSS, mode)
  vendor = inferProductionValue(vendor, mode)
  env = stringifyObject(Object.assign({
    NODE_ENV: mode === 'production' ? 'production' : 'development'
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
    // Point sourcemap entries to original disk location
    .devtoolModuleFilenameTemplate(info =>
      path.resolve(info.absoluteResourcePath))

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
      .add(path.resolve('node_modules'))
      .add(path.resolve(cwd, 'node_modules'))
      .add(ownDir('node_modules'))
      .end()
    .alias
      .set('@', path.resolve(cwd, 'src'))
      .set('vue$', templateCompiler ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.runtime.esm.js')

  config.resolveLoader
    .set('symlinks', true)
    .modules
      .add(path.resolve('node_modules'))
      .add(path.resolve(cwd, 'node_modules'))
      .add(ownDir('node_modules'))

  postcss.plugins = postcss.plugins || []

  if (autoprefixer !== false) {
    postcss.plugins.unshift(require('autoprefixer')(autoprefixer))
  }

  const cssOptions = {
    minimize,
    extract: extractCSS,
    sourceMap: Boolean(sourceMap),
    postcss,
    cssModules,
    fallbackLoader: 'vue-style-loader'
  }

  cssLoaders.standalone(config, cssOptions)

  config.module
    .rule('js')
      .test(/\.jsx?$/)
      .include
        .add(filepath => {
          // for anything outside node_modules
          if (filepath.split(/[/\\]/).indexOf('node_modules') === -1) {
            return true
          }
          return false
        })
        .end()
      .use('babel-loader')
        .loader('babel-loader')
        .options(babel)
        .end()
      .end()
    .rule('es')
      .test(/\.es6?$/)
      .use('babel-loader')
        .loader('babel-loader')
        .options(babel)
        .end()
      .end()
    .rule('vue')
      .test(/\.vue$/)
      .use('vue-loader')
        .loader('vue-loader')
        .options({
          postcss,
          cssModules: {
            localIdentName: '[name]__[local]___[hash:base64:5]',
            camelCase: true
          },
          loaders: Object.assign(cssLoaders.vue(cssOptions), {
            js: {
              loader: 'babel-loader',
              options: babel
            }
          })
        })
        .end()
      .end()
    .rule('static')
      .test(/\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: filename.static
        })
        .end()
      .end()
    .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('file-loader')
        .loader('file-loader')
        .options({
          name: filename.static
        })

  config.plugin('module-concatenation')
    .use(webpack.optimize.ModuleConcatenationPlugin)

  // Enforces the entire path of all required modules match
  // The exact case of the actual path on disk
  config.plugin('paths-case-sensitive')
    .use(PathsCaseSensitivePlugin)

  config.plugin('constants')
    .use(webpack.DefinePlugin, [merge({
      'process.env': env
    }, define && stringifyObject(define))])

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

    config
      .plugin('no-emit-on-errors')
        .use(NoEmitOnErrorsPlugin)
        .end()
      .plugin('progress-bar')
        .use(ProgressPlugin)
        .end()
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
  if (vendor && !format) {
    config.plugin('split-vendor-code')
      .use(webpack.optimize.CommonsChunkPlugin, [{
        name: 'vendor',
        minChunks: module => {
          return module.resource && /\.(js|css|es|es6)$/.test(module.resource) && module.resource.indexOf('node_modules') !== -1
        }
      }])
    config.plugin('split-manifest')
      .use(webpack.optimize.CommonsChunkPlugin, [{
        name: 'manifest'
      }])
  }

  const supportHMR = hotReload !== false && mode === 'development'
  const devClient = ownDir('app/dev-client.es6')

  // Add hmr entry (deprecated)
  // Replace keywords like `[hot]` `:hot:` with hmr entry
  // This will be removed in next major version
  config.entryPoints.store.forEach(v => {
    if (v.has('[hot]') || v.has(':hot:')) {
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
    if (fs.existsSync(path.resolve(cwd, 'static'))) {
      copyOptions.push({
        from: path.resolve(cwd, 'static'),
        to: '.',
        ignore: ['.DS_Store']
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
