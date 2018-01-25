const fs = require('fs')
const path = require('path')
const webpack = require('webpack')
const merge = require('lodash/merge')
const isCI = require('is-ci')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const PathsCaseSensitivePlugin = require('case-sensitive-paths-webpack-plugin')
const yarnGlobal = require('yarn-global')
const Conpack = require('conpack')
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
  const config = new Conpack()

  const useHash = typeof hash === 'boolean' ? hash : (mode === 'production' && !format)
  filename = getFileNames(useHash, filename)
  minimize = inferProductionValue(minimize, mode)
  extractCSS = inferProductionValue(extractCSS, mode)
  env = stringifyObject(Object.assign({
    NODE_ENV: process.env.NODE_ENV
  }, env))

  if (sourceMap !== false) {
    if (typeof sourceMap === 'string') {
      config.set('devtool', sourceMap)
    } else {
      sourceMap = mode === 'production' ?
        'source-map' :
        mode === 'test' ?
        'inline-source-map' :
        'eval-source-map'
      config.set('devtool', sourceMap)
    }
  }

  // Do not resolve path like `:hot:` and `[hot]`
  const handleEntryPath = entry => {
    return /^[[:].+[\]:]$/.test(entry) ? entry : path.resolve(entry)
  }

  if (typeof entry === 'string') {
    config.set('entry.client', [handleEntryPath(entry)])
  } else if (Array.isArray(entry)) {
    config.set('entry.client', entry.map(e => handleEntryPath(e)))
  } else if (typeof entry === 'object') {
    Object.keys(entry).forEach(k => {
      const v = entry[k]
      if (Array.isArray(v)) {
        config.set(['entry', k], v.map(e => handleEntryPath(e)))
      } else {
        config.set(['entry', k], [handleEntryPath(v)])
      }
    })
  }

  config.set('output', {
    path: path.resolve(cwd, dist || 'dist'),
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    filename: filename.js,
    chunkFilename: filename.chunk,
    publicPath: getPublicPath(mode, homepage)
  })

  if (mode !== 'production') {
    // Point sourcemap entries to original disk location
    config.set('output.devtoolModuleFilenameTemplate', info => path.resolve(info.absoluteResourcePath))
  }

  config.set('performance', {
    hints: false
  })

  config.set('resolve', {
    symlinks: true,
    extensions: ['.js', '.jsx', '.json', '.vue'],
    modules: [
      path.resolve(cwd, 'node_modules'),
      'node_modules',
      ownDir('node_modules')
    ],
    alias: {
      '@': path.resolve(cwd, 'src'),
      vue$: templateCompiler ? 'vue/dist/vue.esm.js' : 'vue/dist/vue.runtime.esm.js'
    }
  })

  config.set('resolveLoader', {
    symlinks: true,
    modules: [
      path.resolve(cwd, 'node_modules'),
      'node_modules',
      ownDir('node_modules')
    ]
  })

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

  const imageRule = config.rules.add('image', {
    test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/]
  })
  imageRule.loaders.add('url-loader', {
    loader: 'url-loader',
    options: {
      name: filename.images,
      // inline the file if < max size
      limit: inlineImageMaxSize
    }
  })

  const svgRule = config.rules.add('svg', {
    test: /\.(svg)(\?.*)?$/
  })
  svgRule.loaders.add('file-loader', {
    // SVG files use file-loader directly, why?
    // See https://github.com/facebookincubator/create-react-app/pull/1180
    loader: 'file-loader',
    options: {
      name: filename.images
    }
  })

  const fontRule = config.rules.add('font', {
    test: /\.(eot|otf|webp|ttf|woff|woff2)(\?.*)?$/
  })
  fontRule.loaders.add('file-loader', {
    loader: 'file-loader',
    options: {
      name: filename.fonts
    }
  })

  if (mode === 'development' || mode === 'watch') {
    // Fix startTime before all other webpack plugins
    // See https://github.com/webpack/watchpack/issues/25
    config.plugins.add('timefix', TimeFixPlugin)
  }

  // Enforces the entire path of all required modules match
  // The exact case of the actual path on disk
  config.plugins.add('paths-case-sensitive', PathsCaseSensitivePlugin)

  config.plugins.add('constants', webpack.DefinePlugin, [
    merge(
      // { foo: '"foo"' } => { 'process.env.foo': '"foo"' }
      getFullEnvString(env),
      define && stringifyObject(define)
    )
  ])

  config.plugins.add('fancy-log', FancyLogPlugin, [
    {
      mode,
      host,
      port,
      clear,
      rawErrors
    }
  ])

  if (format === 'cjs') {
    config.set('output.libraryTarget', 'commonjs2')
    webpackUtils.externalize(config)
  } else if (format === 'umd') {
    config.set('output.libraryTarget', 'umd')
    config.set('output.library', moduleName)
  }

  if (extractCSS) {
    config.plugins.add('extract-css', ExtractTextPlugin, [{
      filename: filename.css,
      allChunks: true
    }])
  }

  if (mode === 'production') {
    const ProgressPlugin = require('webpack/lib/ProgressPlugin')
    const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')

    config.plugins.add('no-emit-on-errors', NoEmitOnErrorsPlugin)

    if (progress !== false && !isCI) {
      config.plugins.add('progress-bar', ProgressPlugin)
    }
  }

  if (minimize) {
    config.plugins.add('minimize', webpack.optimize.UglifyJsPlugin, [{
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
    config.plugins.add('split-vendor-code', webpack.optimize.CommonsChunkPlugin, [{
      name: 'vendor',
      minChunks: module => {
        return module.context && module.context.indexOf('node_modules') >= 0
      }
    }])
    config.plugins.add('split-manifest', webpack.optimize.CommonsChunkPlugin, [{
      name: 'manifest'
    }])
  }

  if (mode === 'development' || mode === 'watch') {
    const WatchMissingNodeModulesPlugin = require('poi-dev-utils/watch-missing-node-modules-plugin')

    config.plugins.add('watch-missing-node-modules', WatchMissingNodeModulesPlugin, [
      path.resolve(cwd, 'node_modules')
    ])
  }

  const supportHMR = hotReload !== false && mode === 'development'
  const devClient = ownDir('app/dev-client.es6')

  // Add hmr entry using `hotEntry` option
  if (supportHMR) {
    config.plugins.add('hmr', webpack.HotModuleReplacementPlugin)

    config.plugins.add('named-modules', webpack.NamedModulesPlugin)

    const hotEntryPoints = webpackUtils.getHotEntryPoints(hotEntry)

    for (const entryPoint in config.get('entry')) {
      if (hotEntryPoints.has(entryPoint)) {
        config.prepend(['entry', entryPoint], devClient)
      }
    }
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
      config.plugins.add('copy-static-files', CopyPlugin, [copyOptions])
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
      config.plugins.add(`html-${i}`, HtmlPlugin, [Object.assign({
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
    config.append('resolve.modules', ownDir('..'))
    // loaders in yarn global node_modules
    config.append('resolveLoader.modules', ownDir('..'))
  }

  return config
}
