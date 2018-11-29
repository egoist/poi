const path = require('path')
const fs = require('fs')
const merge = require('lodash.merge')

exports.name = 'builtin:config-html'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
    // No need to generate HTML files for CJS format
    // For UMD format it still might be useful since you can use to test if your library works
    if (api.config.output.format === 'cjs') return

    const HtmlPlugin = require('html-webpack-plugin')
    HtmlPlugin.__expression = `require('html-webpack-plugin')`

    // Split vendors and common chunks
    if (api.mode === 'production') {
      config.optimization.splitChunks({
        cacheGroups: {
          vendors: {
            name: `chunk-vendors`,
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            chunks: 'initial'
          },
          common: {
            name: `chunk-common`,
            minChunks: 2,
            priority: -20,
            chunks: 'initial',
            reuseExistingChunk: true
          }
        }
      })
      // Keep the runtime chunk seperated to enable long term caching
      // https://twitter.com/wSokra/status/969679223278505985
      config.optimization.runtimeChunk(true)
    }

    const DEFAULT_TEMPLATE = path.join(
      __dirname,
      '../webpack/default-template.html'
    )

    const getDefaultTemplate = () => {
      return (
        api.config.defaultHtmlTemplate ||
        (fs.existsSync(api.resolveCwd('public/index.html'))
          ? api.resolveCwd('public/index.html')
          : DEFAULT_TEMPLATE)
      )
    }

    const defaultHtmlOpts = {
      template: getDefaultTemplate(),
      templateParameters: {
        title: api.pkg.data.name || 'Poi App',
        pkg: api.pkg.data,
        envs: api.webpackUtils.envs,
        constants: api.webpackUtils.constants
      },
      pkg: api.pkg.data,
      minify: api.isProd
        ? {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true
          }
        : undefined
    }

    if (api.config.pages) {
      for (const entryName of Object.keys(api.config.pages)) {
        const page = merge(
          defaultHtmlOpts,
          {
            filename: `${entryName}.html`,
            chunks: ['chunk-vendors', 'chunk-common', entryName]
          },
          api.config.pages[entryName]
        )
        page.template = api.resolveCwd(page.template)
        config.plugin(`html-page-${entryName}`).use(HtmlPlugin, [page])
      }
    } else {
      const page = merge(
        defaultHtmlOpts,
        {
          filename: 'index.html'
        },
        api.config.html
      )
      page.template = api.resolveCwd(page.template)
      config.plugin('html').use(HtmlPlugin, [page])
    }
    config
      .plugin('inline-runtime-chunk')
      .use(require('@poi/dev-utils/InlineChunkHtmlPlugin'), [
        require('html-webpack-plugin'),
        [/runtime~.+[.]js/]
      ])
  })
}
