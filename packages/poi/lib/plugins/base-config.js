const path = require('path')
const fs = require('fs')
const merge = require('lodash/merge')
const isCI = require('is-ci')
const webpack = require('webpack')
const yarnGlobal = require('yarn-global')
const {
  getFileNames,
  getPublicPath,
  ownDir,
  getFullEnvString,
  stringifyObject
} = require('../utils')
const webpackUtils = require('../webpack-utils')

module.exports = ctx => {
  let {
    command,
    options: {
      entry,
      outDir = 'dist',
      sourceMap,
      filename,
      homepage,
      cssModules,
      postcss,
      vue: vueOptions,
      // TODO: Remove or rename
      templateCompiler
    }
  } = ctx

  const hash = ctx.inferDefaultValue(ctx.options.hash)
  filename = getFileNames(hash, filename)
  const inWorkspace = __dirname.indexOf('/poi/packages/poi/') > -1
  const ownNodeModules = inWorkspace
    ? ownDir('../../node_modules')
    : ownDir('node_modules')
  const minimize = ctx.inferDefaultValue(ctx.options.minimize)
  const env = Object.assign(
    {
      NODE_ENV: process.env.NODE_ENV
    },
    ctx.options.env
  )
  const cssOptions = {
    minimize,
    extract: ctx.inferDefaultValue(ctx.options.extractCSS),
    sourceMap: Boolean(sourceMap),
    postcss,
    cssModules,
    fallbackLoader: 'vue-style-loader'
  }
  const babel = ctx.options.babel

  function setSourceMap(config) {
    if (sourceMap !== false) {
      if (typeof sourceMap === 'string') {
        config.set('devtool', sourceMap)
      } else {
        sourceMap =
          command === 'build'
            ? 'source-map'
            : command === 'test' ? 'inline-source-map' : 'eval-source-map'
        config.set('devtool', sourceMap)
      }
    }
  }

  function setEntry(config) {
    if (typeof entry === 'string') {
      config.set('entry.main', [path.resolve(entry)])
    } else if (Array.isArray(entry)) {
      config.set('entry.main', entry.map(e => path.resolve(e)))
    } else if (typeof entry === 'object') {
      Object.keys(entry).forEach(k => {
        const v = entry[k]
        if (Array.isArray(v)) {
          config.set(['entry', k], v.map(e => path.resolve(e)))
        } else {
          config.set(['entry', k], [path.resolve(v)])
        }
      })
    }
  }

  function setOutput(config) {
    config.set('output', {
      path: ctx.resolveCwd(outDir),
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: true,
      filename: filename.js,
      chunkFilename: filename.chunk,
      publicPath: getPublicPath(command, homepage)
    })
    if (command !== 'build') {
      // Point sourcemap entries to original disk location
      config.set('output.devtoolModuleFilenameTemplate', info =>
        path.resolve(info.absoluteResourcePath)
      )
    }
  }

  function setPerformance(config) {
    config.set('performance', {
      hints: false
    })
  }

  function setResolve(config) {
    config.set('resolve', {
      symlinks: true,
      extensions: ['.js', '.jsx', '.json', '.vue'],
      modules: [ctx.resolveCwd('node_modules'), 'node_modules', ownNodeModules],
      alias: {
        '@': ctx.resolveCwd('src'),
        vue$: templateCompiler
          ? 'vue/dist/vue.esm.js'
          : 'vue/dist/vue.runtime.esm.js'
      }
    })
  }

  function setResolveLoader(config) {
    config.set('resolveLoader', {
      symlinks: true,
      modules: [ctx.resolveCwd('node_modules'), 'node_modules', ownNodeModules]
    })
  }

  function setCSSRules(config) {
    require('../webpack/css-rules').standalone(config, cssOptions)

    if (cssOptions.extract) {
      config.plugins.add(
        'extract-css',
        require('extract-text-webpack-plugin'),
        [
          {
            filename: filename.css,
            allChunks: true
          }
        ]
      )
    }
  }

  function setJSRules(config) {
    require('../webpack/js-rules')(config, {
      babel,
      transpileModules: ctx.options.transpileModules
    })
  }

  function setVueRules(config) {
    require('../webpack/vue-rules')(config, { babel, vueOptions, cssOptions })
  }

  function setImageRules(config) {
    require('../webpack/image-rules')(config, filename)
  }

  function setFontRules(config) {
    require('../webpack/font-rules')(config, filename)
  }

  function setPlugins(config) {
    if (command === 'develop' || command === 'watch') {
      config.plugins.add('timefix', require('../webpack/timefix-plugin'))
    }

    const { host, port, clearScreen, replace } = ctx.options

    config.plugins.add(
      'paths-case-sensitive',
      require('case-sensitive-paths-webpack-plugin')
    )

    config.plugins.add('replace-string', require('webpack').DefinePlugin, [
      merge(
        // { foo: '"foo"' } => { 'process.env.foo': '"foo"' }
        stringifyObject(getFullEnvString(env)),
        replace && stringifyObject(replace)
      )
    ])

    config.plugins.add('fancy-log', require('../webpack/fancy-log-plugin'), [
      {
        command,
        host,
        port,
        clearScreen
      }
    ])

    if (command === 'build') {
      const ProgressPlugin = require('webpack/lib/ProgressPlugin')
      const NoEmitOnErrorsPlugin = require('webpack/lib/NoEmitOnErrorsPlugin')

      config.plugins.add('no-emit-on-errors', NoEmitOnErrorsPlugin)

      if (
        process.stderr.isTTY &&
        process.env.NODE_ENV !== 'test' &&
        ctx.options.progressBar !== false &&
        !isCI
      ) {
        config.plugins.add('progress-bar', ProgressPlugin)
      }
    }

    if (minimize) {
      config.plugins.add('minimize', webpack.optimize.UglifyJsPlugin, [
        {
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
        }
      ])
    }
  }

  function setFormat(config) {
    const { format, moduleName } = ctx.options
    if (format === 'cjs') {
      config.set('output.libraryTarget', 'commonjs2')
      webpackUtils.externalize(config)
    } else if (format === 'umd') {
      config.set('output.libraryTarget', 'umd')
      config.set('output.library', moduleName)
    }
  }

  function setCodeSplit(config) {
    const splitVendorCode =
      typeof ctx.options.splitVendorCode === 'boolean'
        ? splitVendorCode
        : command !== 'test'
    // Do not split vendor code in `cjs` and `umd` format
    if (splitVendorCode && !ctx.options.format) {
      config.plugins.add(
        'split-vendor-code',
        webpack.optimize.CommonsChunkPlugin,
        [
          {
            name: 'vendor',
            minChunks: module => {
              return (
                module.context && module.context.indexOf('node_modules') >= 0
              )
            }
          }
        ]
      )
      config.plugins.add(
        'split-manifest',
        webpack.optimize.CommonsChunkPlugin,
        [
          {
            name: 'manifest'
          }
        ]
      )
    }
  }

  function setWatchMissingFiles(config) {
    if (command === 'develop' || command === 'watch') {
      const WatchMissingNodeModulesPlugin = require('poi-dev-utils/watch-missing-node-modules-plugin')

      config.plugins.add(
        'watch-missing-node-modules',
        WatchMissingNodeModulesPlugin,
        [ctx.resolveCwd('node_modules')]
      )
    }
  }

  function setHMR(config) {
    const supportHMR = ctx.options.hotReload !== false && command === 'develop'
    const devClient = require.resolve('poi-dev-utils/hot-dev-client')

    // Add hmr entry using `hotEntry` option
    if (supportHMR) {
      config.plugins.add('hmr', webpack.HotModuleReplacementPlugin)

      config.plugins.add('named-modules', webpack.NamedModulesPlugin)

      const hotEntryPoints = webpackUtils.getHotEntryPoints(ctx.options.hotEntry)

      for (const entryPoint in config.get('entry')) {
        if (hotEntryPoints.has(entryPoint)) {
          config.prepend(['entry', entryPoint], devClient)
        }
      }
    }
  }

  function setCopyFiles(config) {
    let { copy, staticFolder = 'static' } = ctx.options

    if (copy !== false) {
      const CopyPlugin = require('copy-webpack-plugin')

      let copyOptions = []
      if (fs.existsSync(ctx.resolveCwd(staticFolder))) {
        copyOptions.push({
          from: ctx.resolveCwd(staticFolder),
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
  }

  function setHTML(config) {
    let { html } = ctx.options

    if (html !== false && command !== 'test') {
      const HtmlPlugin = require('html-webpack-plugin')

      html = html || {}
      const htmls = Array.isArray(html) ? html : [html]
      const defaultHtml = {
        title: 'Poi',
        template: ownDir('lib/index.ejs'),
        env
      }
      htmls.forEach((h, i) => {
        config.plugins.add(`html-${i}`, HtmlPlugin, [
          Object.assign(
            {
              minify: {
                collapseWhitespace: minimize,
                minifyCSS: minimize,
                minifyJS: minimize
              }
            },
            defaultHtml,
            h
          )
        ])
      })
    }
  }

  ctx.extendWebpack(config => {
    setSourceMap(config)
    setEntry(config)
    setOutput(config)
    setPerformance(config)
    setResolve(config)
    setResolveLoader(config)
    setCSSRules(config)
    setJSRules(config)
    setVueRules(config)
    setImageRules(config)
    setFontRules(config)
    setPlugins(config)
    setFormat(config)
    setCodeSplit(config)
    setWatchMissingFiles(config)
    setHMR(config)
    setCopyFiles(config)
    setHTML(config)

    // installed by `yarn global add`
    if (yarnGlobal.inDirectory(__dirname)) {
      // modules in yarn global node_modules
      // because of yarn's flat node_modules structure
      config.append('resolve.modules', ownDir('..'))
      // loaders in yarn global node_modules
      config.append('resolveLoader.modules', ownDir('..'))
    }

    config.plugins.add('develop-logs', class {
      apply(compiler) {
        compiler.plugin('done', stats => {
          if (!stats.hasErrors() && !stats.hasWarnings()) {
            ctx.emit('show-develop-logs')
          }
        })
      }
    })
  })
}
