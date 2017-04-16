const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const Config = require('webpack-chain')
const nodeExternals = require('webpack-node-externals')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const isYarn = require('installed-by-yarn-globally')
const cssLoaders = require('./css-loaders')
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
  copy
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
  babel = babel && (babel.babelrc !== false) ? babel : {
    babelrc: false,
    presets: [require.resolve('babel-preset-vue-app')]
  }

  if (typeof sourceMap === 'undefined') {
    sourceMap = mode === 'production' ? 'source-map' : 'eval-source-map'
  }
  config.devtool(sourceMap)

  if (typeof entry === 'string') {
    config.entry('client').add(path.resolve(cwd, entry))
  } else if (Array.isArray(entry)) {
    config.entry('client').merge(entry.map(e => path.resolve(cwd, e)))
  } else if (typeof entry === 'object') {
    Object.keys(entry).forEach(k => {
      const v = entry[k]
      if (Array.isArray(v)) {
        config.entry(k).merge(v.map(e => path.resolve(cwd, e)))
      } else {
        config.entry(k).add(path.resolve(cwd, v))
      }
    })
  }

  config.output
    .path(path.resolve(cwd, dist || 'dist'))
    .filename(filename.js)
    .chunkFilename(filename.chunk)
    .publicPath(getPublicPath(mode, homepage))

  config.performance.hints(false)

  config.resolve
    .extensions
      .add('.js')
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
    .modules
      .add(path.resolve('node_modules'))
      .add(path.resolve(cwd, 'node_modules'))
      .add(ownDir('node_modules'))

  const cssOptions = {
    minimize,
    extractCSS,
    sourceMap: Boolean(sourceMap),
    postcss,
    cssModules
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
      .use('babel')
        .loader(require.resolve('@ream/babel-loader'))
        .options(babel)
        .end()
      .end()
    .rule('es')
      .test(/\.es6?$/)
      .use('babel')
        .loader(require.resolve('@ream/babel-loader'))
        .options(babel)
        .end()
      .end()
    .rule('vue')
      .test(/\.vue$/)
      .use('vue')
        .loader(require.resolve('vue-loader'))
        .options({
          loaders: Object.assign(cssLoaders.vue(cssOptions), {
            js: {
              loader: require.resolve('@ream/babel-loader'),
              options: babel
            }
          })
        })
        .end()
      .end()
    .rule('static')
      .test(/\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/)
      .use('file')
        .loader(require.resolve('file-loader'))
        .options({
          name: filename.static
        })
        .end()
      .end()
    .rule('svg')
      .test(/\.(svg)(\?.*)?$/)
      .use('file')
        .loader(require.resolve('file-loader'))
        .options({
          name: filename.static
        })

  config.plugin('constants')
    .use(webpack.DefinePlugin, [{
      process: {
        env
      }
    }])

  postcss.plugins = postcss.plugins || []
  if (autoprefixer !== false) {
    postcss.plugins.unshift(require('autoprefixer')(Object.assign({
      browsers: ['ie > 8', 'last 3 versions']
    }, autoprefixer)))
  }

  if (format === 'cjs' || mode === 'test') {
    config.output.libraryTarget('commonjs2')
    config.externals([
      nodeExternals({
        whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
      }),
      'vue',
      'babel-runtime'
    ])
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

  // Customizations for test mode
  if (mode === 'test') {
    config
      .target('node')
      .output
        .path(path.resolve(cwd, dist || 'output_test'))
        .filename('test.js')
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

  if (vendor) {
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

  if (mode === 'development' && config.entryPoints.has('client')) {
    config.entry('client')
      .prepend(ownDir('lib/dev-client.es6'))
    config.plugin('hmr')
      .use(webpack.HotModuleReplacementPlugin)
  }

  if (copy !== false && fs.existsSync(path.resolve(cwd, 'static'))) {
    config.plugin('copy-static-files')
      .use(CopyPlugin, [[{
        from: path.resolve(cwd, 'static'),
        to: '.',
        ignore: ['.DS_Store']
      }]])
  }

  if (html !== false && mode !== 'test') {
    html = html || {}
    const htmls = Array.isArray(html) ? html : [html]
    const defaultHtml = {
      title: 'vbuild',
      template: ownDir('lib/index.html'),
      env
    }
    htmls.forEach((h, i) => {
      config.plugin(`html-${i}`)
        .use(HtmlPlugin, [Object.assign({}, defaultHtml, h)])
    })
  }

  // installed by `yarn global add`
  if (isYarn(__dirname)) {
    // modules in yarn global node_modules
    // because of yarn's flat node_modules structure
    config.resolve.modules.add(ownDir('..'))
    // loaders in yarn global node_modules
    config.resolveLoader.modules.add(ownDir('..'))
  }

  return config
}
