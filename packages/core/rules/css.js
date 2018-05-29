module.exports = (
  config,
  {
    extract,
    sourceMap,
    cssModules: _cssModules,
    minimize,
    styleLoader,
    postcss,
    filename,
    chunkFilename,
    isProd
  }
) => {
  function createCSSRule(
    lang,
    { test, loader, options, cssModules, cssModulesVue }
  ) {
    const baseRule = config.module.rule(lang).test(test)

    if (cssModulesVue) {
      // Add moduleQueryRule so `<style module>` works
      const moduleQueryRule = baseRule
        .oneOf('module-query')
        .resourceQuery(/module/)
      const normalRule = baseRule.oneOf('normal')
      applyLoaders(moduleQueryRule, true)
      applyLoaders(normalRule, false)
    } else {
      const normalRule = baseRule.oneOf('normal')
      applyLoaders(normalRule, cssModules)
    }

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

  function createCSSRules({ cssModules, cssModulesVue, moduleExt }) {
    const test = ext => new RegExp(`${moduleExt ? '.module' : ''}${ext}$`)
    const name = name => `${name}${moduleExt ? '-module' : ''}`
    createCSSRule(name('css'), {
      test: test('.css'),
      cssModules,
      cssModulesVue
    })
    createCSSRule(name('scss'), {
      test: test('.scss'),
      cssModules,
      cssModulesVue,
      loader: 'sass-loader'
    })
    createCSSRule(name('sass'), {
      test: test('.sass'),
      loader: 'sass-loader',
      cssModules,
      cssModulesVue,
      options: { indentedSyntax: true }
    })
    createCSSRule(name('less'), {
      test: test('.less'),
      cssModules,
      cssModulesVue,
      loader: 'less-loader'
    })
    createCSSRule(name('stylus'), {
      test: test('.styl(us)?'),
      loader: 'stylus-loader',
      cssModules,
      cssModulesVue,
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

  // for .css and <style module> rules
  createCSSRules({ cssModulesVue: true, cssModules: _cssModules })
  // for .module.css rules
  createCSSRules({ cssModulesVue: false, cssModules: true, moduleExt: true })
}
