const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const isCI = require('is-ci')
const yarnGlobal = require('yarn-global')
const getFullEnvString = require('./utils/getFullEnvString')
const stringifyObject = require('./utils/stringifyObject')

module.exports = poi => {
  const { command } = poi

  const inWorkspace = __dirname.includes(path.normalize('/poi/packages/'))
  const ownNodeModules = inWorkspace
    ? poi.ownDir('../../node_modules')
    : poi.ownDir('node_modules')

  function setOutput(config) {
    config.set('output', {
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
      config.plugins.add('hmr', webpack.HotModuleReplacementPlugin)
      config.plugins.add('named-modules', webpack.NamedModulesPlugin)
      for (const entryPoint in config.get('entry')) {
        if (poi.options.hotEntry.includes(entryPoint)) {
          config.prepend(['entry', entryPoint], devClient)
        }
      }
    }
  }

  function setPerformance(config) {
    config.set('performance.hints', false)
  }

  function setFormat(config) {
    if (poi.options.format === 'cjs') {
      config.set('output.libraryTarget', 'commonjs2')
    } else if (poi.options.format === 'umd') {
      config.set('output.libraryTarget', 'umd')
      config.set('output.library', poi.options.moduleName)
    }
  }

  function setExternals(config) {
    config.set('externals', poi.options.externals)
  }

  function setResolve(config) {
    config.set('resolve', {
      symlinks: true,
      extensions: ['.js', '.jsx', '.json', '.vue'],
      modules: [poi.resolveCwd('node_modules'), 'node_modules', ownNodeModules],
      alias: {
        '@': poi.resolveCwd('src'),
        vue$: poi.options.vue.fullBuild
          ? 'vue/dist/vue.esm.js'
          : 'vue/dist/vue.runtime.esm.js'
      }
    })
  }

  function setResolveLoader(config) {
    config.set('resolveLoader', {
      symlinks: true,
      modules: [poi.resolveCwd('node_modules'), 'node_modules', ownNodeModules]
    })
  }

  function setCSSRules(config) {
    require('./rules/css').standalone(config, poi.options.css)
  }

  function setJSRules(config) {
    require('./rules/js')(config, {
      babel: poi.options.babel,
      transpileModules: poi.options.transpileModules
    })
  }

  function setVueRules(config) {
    require('./rules/vue')(config, {
      babel: poi.options.babel,
      vueOptions: poi.options.vue.loader,
      cssOptions: poi.options.css
    })
  }

  function setImageRules(config) {
    require('./rules/image')(config, poi.options.filename)
  }

  function setFontRules(config) {
    require('./rules/font')(config, poi.options.filename)
  }

  function setPlugins(config) {
    if (command === 'develop' || command === 'watch') {
      config.plugins.add('timefix', require('time-fix-plugin'))
    }

    config.plugins.add(
      'paths-case-sensitive',
      require('case-sensitive-paths-webpack-plugin')
    )

    config.plugins.add('replace-string', webpack.DefinePlugin, [
      stringifyObject(getFullEnvString(poi.options.env))
    ])

    config.plugins.add(
      'no-emit-on-errors',
      require('webpack/lib/NoEmitOnErrorsPlugin')
    )
    config.plugins.add('fancy-log', require('./webpack/FancyLogPlugin'), [
      {
        command: poi.command,
        host: poi.options.host,
        port: poi.options.port,
        clearScreen: poi.options.clearScreen
      }
    ])

    if (
      process.stderr.isTTY &&
      process.env.NODE_ENV !== 'test' &&
      poi.options.progress !== false &&
      !isCI
    ) {
      config.plugins.add('progress', require('./webpack/ProgressPlugin'))
    }
  }

  function setWatchMissingFiles(config) {
    if (command === 'develop' || command === 'watch') {
      config.plugins.add(
        'watch-missing-node-modules',
        require('./webpack/WatchMissingNodeModulesPlugin'),
        [poi.resolveCwd('node_modules')]
      )
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
        config.plugins.add(
          'copy-static-files',
          require('copy-webpack-plugin'),
          [copyOptions]
        )
      }
    }
  }

  function setHTML(config) {
    let { html } = poi.options

    if (html !== false && command !== 'test') {
      html = html || {}
      const htmls = Array.isArray(html) ? html : [html]
      const defaultHtml = {
        title: 'Poi',
        template: poi.ownDir('lib/index.ejs'),
        env: poi.options.env
      }
      htmls.forEach((h, i) => {
        config.plugins.add(`html-${i}`, require('html-webpack-plugin'), [
          Object.assign(
            {
              minify: {
                collapseWhitespace: poi.options.minimize,
                minifyCSS: poi.options.minimize,
                minifyJS: poi.options.minimize
              }
            },
            defaultHtml,
            h
          )
        ])
      })
    }
  }

  poi.extendWebpack(config => {
    config.set('mode', poi.env === 'production' ? 'production' : 'development')

    config.set('optimization.minimize', poi.options.minimize)

    config.set('devtool', poi.options.sourceMap)

    config.set('entry', poi.options.entry)

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
    setPlugins(config)
    setWatchMissingFiles(config)
    setCopyFiles(config)
    setHTML(config)

    // installed by `yarn global add`
    if (yarnGlobal.inDirectory(__dirname)) {
      // modules in yarn global node_modules
      // because of yarn's flat node_modules structure
      config.append('resolve.modules', poi.ownDir('..'))
      // loaders in yarn global node_modules
      config.append('resolveLoader.modules', poi.ownDir('..'))
    }

    config.plugins.add(
      'develop-logs',
      class {
        apply(compiler) {
          compiler.plugin('done', stats => {
            if (!stats.hasErrors() && !stats.hasWarnings()) {
              poi.emit('show-develop-logs')
            }
          })
        }
      }
    )
  })
}
