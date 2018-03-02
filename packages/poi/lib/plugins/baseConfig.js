const path = require('path')
const fs = require('fs')
const merge = require('lodash/merge')
const isCI = require('is-ci')
const webpack = require('poi-webpack-utils/webpack')
const yarnGlobal = require('yarn-global')
const getFileNames = require('poi-webpack-utils/helpers/getFileNames')
const getFullEnvString = require('poi-webpack-utils/helpers/getFullEnvString')
const stringifyObject = require('poi-webpack-utils/helpers/stringifyObject')
const getPublicPath = require('../utils/getPublicPath')
const { ownDir } = require('../utils/dir')
const webpackUtils = require('../webpackUtils')

module.exports = poi => {
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
  } = poi

  const hash = poi.inferDefaultValue(poi.options.hash)
  filename = getFileNames(hash, filename)
  const inWorkspace = __dirname.indexOf('/poi/packages/poi/') > -1
  const ownNodeModules = inWorkspace
    ? ownDir('../../node_modules')
    : ownDir('node_modules')
  const minimize = poi.inferDefaultValue(poi.options.minimize)
  const env = Object.assign(
    {
      NODE_ENV: process.env.NODE_ENV
    },
    poi.options.env
  )
  const cssOptions = {
    minimize,
    extract: poi.inferDefaultValue(poi.options.extractCSS),
    sourceMap: Boolean(sourceMap),
    postcss,
    cssModules,
    fallbackLoader: 'vue-style-loader',
    filename: filename.css
  }
  const babel = poi.options.babel

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
      path: poi.resolveCwd(outDir),
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
      modules: [poi.resolveCwd('node_modules'), 'node_modules', ownNodeModules],
      alias: {
        '@': poi.resolveCwd('src'),
        vue$: templateCompiler
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
    require('poi-webpack-utils/rules/css').standalone(config, cssOptions)
  }

  function setJSRules(config) {
    require('poi-webpack-utils/rules/js')(config, {
      babel,
      transpileModules: poi.options.transpileModules
    })
  }

  function setVueRules(config) {
    require('poi-webpack-utils/rules/vue')(config, {
      babel,
      vueOptions,
      cssOptions
    })
  }

  function setImageRules(config) {
    require('poi-webpack-utils/rules/image')(config, filename)
  }

  function setFontRules(config) {
    require('poi-webpack-utils/rules/font')(config, filename)
  }

  function setPlugins(config) {
    if (command === 'develop' || command === 'watch') {
      // It doesn't work with webpack 4 for now
      // config.plugins.add(
      //   'timefix',
      //   require('poi-webpack-utils/plugins/TimeFixPlugin')
      // )
    }

    const { host, port, clearScreen, replace } = poi.options

    config.plugins.add(
      'paths-case-sensitive',
      require('case-sensitive-paths-webpack-plugin')
    )

    config.plugins.add(
      'replace-string',
      require('poi-webpack-utils/webpack').DefinePlugin,
      [
        merge(
          // { foo: '"foo"' } => { 'process.env.foo': '"foo"' }
          stringifyObject(getFullEnvString(env)),
          replace && stringifyObject(replace)
        )
      ]
    )

    config.plugins.add('fancy-log', require('../webpack/fancyLogPlugin'), [
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
        poi.options.progressBar !== false &&
        !isCI
      ) {
        config.plugins.add('progress-bar', ProgressPlugin)
      }
    }

    if (typeof minimize === 'boolean') {
      config.set('optimization.minimize', minimize)
    }
  }

  function setFormat(config) {
    const { format, moduleName } = poi.options
    if (format === 'cjs') {
      config.set('output.libraryTarget', 'commonjs2')
      webpackUtils.externalize(config)
    } else if (format === 'umd') {
      config.set('output.libraryTarget', 'umd')
      config.set('output.library', moduleName)
    }
  }

  function setWatchMissingFiles(config) {
    if (command === 'develop' || command === 'watch') {
      const WatchMissingNodeModulesPlugin = require('poi-webpack-utils/plugins/WatchMissingNodeModulesPlugin')

      config.plugins.add(
        'watch-missing-node-modules',
        WatchMissingNodeModulesPlugin,
        [poi.resolveCwd('node_modules')]
      )
    }
  }

  function setHMR(config) {
    const supportHMR = poi.options.hotReload !== false && command === 'develop'
    const devClient = require.resolve('poi-dev-utils/hotDevClient')

    // Add hmr entry using `hotEntry` option
    if (supportHMR) {
      config.plugins.add('hmr', webpack.HotModuleReplacementPlugin)

      config.plugins.add('named-modules', webpack.NamedModulesPlugin)

      const hotEntryPoints = webpackUtils.getHotEntryPoints(
        poi.options.hotEntry
      )

      for (const entryPoint in config.get('entry')) {
        if (hotEntryPoints.has(entryPoint)) {
          config.prepend(['entry', entryPoint], devClient)
        }
      }
    }
  }

  function setCopyFiles(config) {
    const { copy, staticFolder = 'static' } = poi.options

    if (copy !== false) {
      const CopyPlugin = require('copy-webpack-plugin')

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
        config.plugins.add('copy-static-files', CopyPlugin, [copyOptions])
      }
    }
  }

  function setHTML(config) {
    let { html } = poi.options

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

  poi.extendWebpack(config => {
    config.set('mode', command === 'build' ? 'production' : 'development')
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
