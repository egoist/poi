const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const yarnGlobal = require('yarn-global')
const getFullEnvString = require('./utils/getFullEnvString')
const stringifyObject = require('./utils/stringifyObject')
const ownDir = require('./utils/ownDir')

exports.name = 'builtin:createWebpackConfig'

exports.apply = poi => {
  const { command } = poi

  const inWorkspace = __dirname.includes(path.normalize('/poi/packages/'))
  // node_modules in @poi/core/node_modules
  const ownNodeModules = inWorkspace
    ? ownDir('../../node_modules')
    : ownDir('node_modules')

  function setOutput(config) {
    config.output.merge({
      path: poi.options.outDir,
      pathinfo: true,
      filename: poi.options.filename.js,
      chunkFilename: poi.options.filename.chunk,
      publicPath: poi.options.publicPath
    })
  }

  function setHMR(config) {
    const devClient = require.resolve('@poi/dev-utils/hotDevClient')

    // Add hmr entry using `hotEntry` option
    if (poi.options.hotReload) {
      config.plugin('hmr').use(webpack.HotModuleReplacementPlugin)
      config.plugin('named-modules').use(webpack.NamedModulesPlugin)
      for (const hotEntry of poi.options.hotEntry) {
        if (config.entryPoints.has(hotEntry)) {
          config.entry(hotEntry).prepend(devClient)
        }
      }
    }
  }

  function setPerformance(config) {
    config.performance.hints(false)
  }

  function setFormat(config) {
    if (poi.options.format === 'cjs') {
      config.output.libraryTarget('commonjs2')
    } else if (poi.options.format === 'umd') {
      config.output.libraryTarget('umd')
      config.output.library(poi.options.moduleName)
    }
  }

  function setExternals(config) {
    config.externals(poi.options.externals)
  }

  function setResolve(config) {
    config.resolve.symlinks(true)
    config.resolve.extensions
      .add('.js')
      .add('.jsx')
      .add('.json')
      .add('.vue')
    config.resolve.modules
      .add(poi.resolveCwd('node_modules'))
      .add('node_modules')
      .add(ownNodeModules)
    config.resolve.alias
      .set('@', poi.resolveCwd('src'))
      .set(
        'vue$',
        poi.options.vue.fullBuild
          ? 'vue/dist/vue.esm.js'
          : 'vue/dist/vue.runtime.esm.js'
      )
  }

  function setResolveLoader(config) {
    config.resolveLoader.set('symlinks', true)
    config.resolveLoader.modules
      .add(poi.resolveCwd('node_modules'))
      .add('node_modules')
      .add(ownNodeModules)
  }

  function setCSSRules(config) {
    require('./rules/css')(config, poi.options.css)
  }

  function setJSRules(config) {
    require('./rules/js')(config, poi.options.babel)
  }

  function setCoffeeRules(config) {
    require('./rules/coffee')(config, poi.options.babel)
  }

  function setVueRules(config) {
    require('./rules/vue')(config, {
      babel: poi.options.babel.config,
      vueOptions: poi.options.vue.loaderOptions,
      cssOptions: poi.options.css
    })
  }

  function setImageRules(config) {
    require('./rules/image')(config, poi.options)
  }

  function setFontRules(config) {
    require('./rules/font')(config, poi.options.filename)
  }

  function setPlugins(config) {
    if (command === 'develop' || command === 'watch') {
      config.plugin('timefix').use(require('time-fix-plugin'))
    }

    config
      .plugin('define')
      .use(webpack.DefinePlugin, [
        Object.assign(
          {},
          stringifyObject(getFullEnvString(poi.env)),
          poi.options.define
        )
      ])

    config
      .plugin('no-emit-on-errors')
      .use(require('webpack/lib/NoEmitOnErrorsPlugin'))

    if (process.env.NODE_ENV !== 'test' && poi.options.progress !== false) {
      if (poi.options.progress === 'simple') {
        config.plugin('simple-progress').use(webpack.ProgressPlugin)
      } else {
        config.plugin('webpackbar').use(require('webpackbar'), [
          {
            name: 'Poi',
            profile: poi.options.profile,
            compiledIn: false
          }
        ])
      }
    }

    if (process.env.NODE_ENV !== 'test') {
      config
        .plugin('friendly-reporter')
        .use(require('friendly-webpack-reporter'), [
          {
            showFileStats: poi.command === 'build',
            logger: require('@poi/logger'),
            clearConsole: poi.options.clearConsole
          }
        ])
    }
  }

  function setWatchMissingFiles(config) {
    if (command === 'develop' || command === 'watch') {
      config
        .plugin('watch-missing-node-modules')
        .use(require('./webpack/WatchMissingNodeModulesPlugin'), [
          poi.resolveCwd('node_modules')
        ])
    }
  }

  function setCopyFiles(config) {
    const { copy, staticFolder = 'static' } = poi.options

    if (copy !== false) {
      let copyOptions = []
      if (fs.existsSync(poi.resolveCwd(staticFolder))) {
        copyOptions.push({
          from: poi.resolveCwd(staticFolder),
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
        config
          .plugin('copy-static-files')
          .use(require('copy-webpack-plugin'), [copyOptions])
      }
    }
  }

  function setHTML(config) {
    let { html } = poi.options

    if (html && html.length > 0) {
      html.forEach((v, i) => {
        config.plugin(`html-${i}`).use(require('html-webpack-plugin'), [v])
      })
    }
  }

  poi.chainWebpack(config => {
    config.merge({
      mode: poi.command === 'build' ? 'production' : 'development',
      entry: poi.options.entry,
      devtool: poi.options.sourceMap,
      optimization: {
        minimize: poi.options.minimize,
        minimizer: [
          {
            apply(compiler) {
              const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
              new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap:
                  poi.options.sourceMap &&
                  /source-?map/.test(poi.options.sourceMap),
                uglifyOptions: {
                  output: {
                    comments: false
                  },
                  mangle: true
                }
              }).apply(compiler)
            }
          }
        ],
        splitChunks: {
          chunks: poi.options.format || poi.command === 'test' ? 'async' : 'all'
        }
      }
    })

    function setGraphql(config) {
      require('./rules/graphql')(config)
    }

    function setReason(config) {
      require('./rules/reason')(config)
    }

    function setPug(config) {
      require('./rules/pug')(config)
    }

    setOutput(config)
    setPerformance(config)
    setExternals(config)
    setResolve(config)
    setResolveLoader(config)
    setHMR(config)
    setFormat(config)
    setCSSRules(config)
    setJSRules(config)
    setVueRules(config)
    setImageRules(config)
    setFontRules(config)
    setCoffeeRules(config)
    setPlugins(config)
    setWatchMissingFiles(config)
    setCopyFiles(config)
    setHTML(config)
    setGraphql(config)
    setReason(config)
    setPug(config)

    // installed by `yarn global add`
    if (yarnGlobal.inDirectory(__dirname)) {
      // modules in yarn global node_modules
      // because of yarn's flat node_modules structure
      config.resolve.modules.add(poi.ownDir('..'))
      // loaders in yarn global node_modules
      config.resolveLoader.modules.add(poi.ownDir('..'))
    }

    config.plugin('clean-out-dir').use(
      class CleanOutDir {
        apply(compiler) {
          compiler.hooks.emit.tapPromise('clean-out-dir', async () => {
            if (
              poi.options.cleanOutDir ||
              /\[(chunk)?hash(:\d+)?\]/.test(compiler.options.output.filename)
            ) {
              await require('trash')([compiler.options.output.path])
            }
          })
        }
      }
    )

    config.plugin('develop-logs').use(
      class DevelopLogs {
        apply(compiler) {
          compiler.hooks.done.tap('develop-logs', stats => {
            if (!stats.hasErrors() && !stats.hasWarnings()) {
              poi.emit('show-develop-logs')
            }
          })
        }
      }
    )
  })
}
