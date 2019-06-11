const logger = require('@poi/logger')

exports.name = 'builtin:config-css'

exports.cli = ({ command, isProd }) => {
  if (isProd) {
    command.option('--no-extract-css', `Don't extract CSS files`)
  } else {
    command.option('--extract-css', 'Extract CSS files')
  }
}

exports.apply = api => {
  api.hook('createWebpackChain', (config, { type }) => {
    const {
      loaderOptions = {},
      extract: shouldExtract,
      sourceMap = api.config.output.sourceMap
    } = api.config.css || {}
    const isServer = type === 'server'

    const hasPostCSSConfig = api.configLoader.resolve({
      files: [
        'postcss.config.js',
        'package.json',
        '.postcssrc',
        '.postcssrc.js',
        '.postcssrc.yaml',
        '.postcssrc.json'
      ],
      packageKey: 'postcss'
    })

    if (hasPostCSSConfig) {
      logger.debug('Applying custom PostCSS config at ' + hasPostCSSConfig)
    }

    // if building for production but not extracting CSS, we need to minimize
    // the embbeded inline CSS as they will not be going through the optimizing
    // plugin.
    const needInlineMinification = api.config.output.minimize && !shouldExtract

    const cssnanoOptions = {
      safe: true,
      autoprefixer: { disable: true },
      mergeLonghand: false
    }
    if (sourceMap) {
      cssnanoOptions.map = { inline: false }
    }

    const extractOptions = {
      filename: api.config.output.fileNames.css,
      chunkFilename: api.config.output.fileNames.css.replace(
        /\.css$/,
        '.chunk.css'
      )
    }

    const createCSSRule = (lang, test, loader, options) => {
      const applyLoaders = (rule, modules) => {
        if (!isServer) {
          if (shouldExtract) {
            rule
              .use('extract-css-loader')
              .loader(require('mini-css-extract-plugin').loader)
              .options({
                hmr: api.mode === 'development',
                reloadAll: true
              })
          } else {
            rule
              .use('vue-style-loader')
              .loader(require.resolve('vue-style-loader'))
              .options({
                sourceMap
              })
          }
        }

        const cssLoaderOptions = Object.assign(
          {
            sourceMap,
            modules,
            localIdentName: '[name]_[local]_[hash:base64:5]',
            importLoaders:
              1 + // stylePostLoader injected by vue-loader
              (hasPostCSSConfig ? 1 : 0) +
              (needInlineMinification ? 1 : 0),
            exportOnlyLocals: isServer
          },
          loaderOptions.css
        )

        rule
          .use('css-loader')
          .loader(require.resolve('css-loader'))
          .options(cssLoaderOptions)

        if (needInlineMinification) {
          rule
            .use('minify-inline-css')
            .loader(require.resolve('postcss-loader'))
            .options({
              plugins: [require('cssnano')(cssnanoOptions)]
            })
        }

        if (hasPostCSSConfig) {
          rule
            .use('postcss-loader')
            .loader(require.resolve('postcss-loader'))
            .options(Object.assign({ sourceMap }, loaderOptions.postcss))
        }

        if (loader) {
          rule
            .use(loader)
            .loader(loader)
            .options(Object.assign({ sourceMap }, options))
        }
      }

      const baseRule = config.module.rule(lang).test(test)

      // Prevent webpack from unexpectedly dropping local CSS files
      // https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free
      // https://github.com/webpack/webpack/issues/6741
      baseRule.sideEffects(true)

      // rules for <style lang="module">
      const vueModulesRule = baseRule
        .oneOf('vue-modules')
        .resourceQuery(/module/)
      applyLoaders(vueModulesRule, true)

      // rules for <style>
      const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/)
      applyLoaders(vueNormalRule, false)

      // rules for *.module.* files
      const extModulesRule = baseRule
        .oneOf('normal-modules')
        .test(/\.module\.\w+$/)
      applyLoaders(extModulesRule, true)

      // rules for normal CSS imports
      const normalRule = baseRule.oneOf('normal')
      applyLoaders(normalRule, false)
    }

    if (shouldExtract) {
      config
        .plugin('extract-css')
        .use(require('mini-css-extract-plugin'), [extractOptions])

      const OptimizeCSSPlugin = require('@intervolga/optimize-cssnano-plugin')
      config.plugin('optimize-css').use(OptimizeCSSPlugin, [
        {
          sourceMap,
          cssnanoOptions
        }
      ])
    }

    createCSSRule('css', /\.css$/)
    createCSSRule('postcss', /\.p(ost)?css$/)

    const sassImplementation = api.hasDependency('sass')
      ? api.localRequire('sass')
      : undefined
    createCSSRule(
      'scss',
      /\.scss$/,
      'sass-loader',
      Object.assign(
        {
          implementation: sassImplementation
        },
        loaderOptions.sass
      )
    )
    createCSSRule(
      'sass',
      /\.sass$/,
      'sass-loader',
      Object.assign(
        {
          indentedSyntax: true,
          implementation: sassImplementation
        },
        loaderOptions.sass
      )
    )

    createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less)
    createCSSRule(
      'stylus',
      /\.styl(us)?$/,
      'stylus-loader',
      Object.assign(
        {
          preferPathResolver: 'webpack'
        },
        loaderOptions.stylus
      )
    )
  })
}
