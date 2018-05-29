module.exports = (
  config,
  {
    extract,
    sourceMap,
    cssModules,
    minimize,
    styleLoader,
    postcss,
    filename,
    chunkFilename,
    isProd
  }
) => {
  function createCSSRule(lang, { test, loader, options }) {
    const baseRule = config.module.rule(lang).test(test)

    const moduleQueryRule = baseRule
      .oneOf('module-query')
      .resourceQuery(/module/)
    const moduleExtRule = baseRule.oneOf('module-ext').test(/\.module\.\w+$/)
    const normalRule = baseRule.oneOf('normal')
    applyLoaders(moduleQueryRule, true)
    applyLoaders(moduleExtRule, true)
    applyLoaders(normalRule, cssModules)

    function applyLoaders(rule, modules) {
      if (extract) {
        rule
          .use('extract-loader')
          .loader(require('mini-css-extract-plugin').loader)
      } else {
        rule.use('style-loader').loader(styleLoader)
      }

      rule
        .use('css-loader')
        .loader('css-loader')
        .options({
          modules,
          sourceMap,
          localIdentName: `[local]_[hash:base64:8]`,
          importLoaders: Boolean(postcss) + Boolean(loader),
          minimize
        })

      if (postcss) {
        rule
          .use('postcss-loader')
          .loader('postcss-loader')
          .options(
            Object.assign(
              {
                sourceMap
              },
              postcss
            )
          )
      }

      if (loader) {
        rule
          .use(loader)
          .loader(loader)
          .options(
            Object.assign(
              {
                sourceMap
              },
              options
            )
          )
      }
    }
  }

  function createCSSRules() {
    createCSSRule('css', {
      test: /\.css$/
    })
    createCSSRule('scss', {
      test: /\.scss$/,
      loader: 'sass-loader'
    })
    createCSSRule('sass', {
      test: /\.sass$/,
      loader: 'sass-loader',
      options: { indentedSyntax: true }
    })
    createCSSRule('less', {
      test: /\.less$/,
      loader: 'less-loader'
    })
    createCSSRule('stylus', {
      test: /\.styl(us)?/,
      loader: 'stylus-loader',
      options: {
        preferPathResolver: 'webpack'
      }
    })
  }

  if (extract) {
    config.plugin('extract-css').use(require('mini-css-extract-plugin'), [
      {
        filename,
        chunkFilename
      }
    ])
  }

  if (isProd) {
    const cssProcessorOptions = {
      safe: true,
      autoprefixer: { disable: true },
      mergeLonghand: false
    }
    if (sourceMap) {
      cssProcessorOptions.map = { inline: false }
    }
    config
      .plugin('optimize-css')
      .use(require('optimize-css-assets-webpack-plugin'), [
        {
          canPrint: false,
          cssProcessorOptions
        }
      ])
  }

  createCSSRules()
}
