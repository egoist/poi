const path = require('path')
const fs = require('fs')

exports.extend = api => {
  if (api.config.target !== 'app') return

  api.chainWebpack(config => {
    // Split vendors and common chunks
    if (api.isCommand('build')) {
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
    }

    // Generate HTML files for each entry
    const HtmlPlugin = require('html-webpack-plugin')
    HtmlPlugin.__expression = `require('html-webpack-plugin')`

    for (const entryName of Object.keys(api.config.pages)) {
      const page = Object.assign(
        {
          template: 'public/index.html',
          title: api.projectPkg.data.name || 'Poi App',
          filename: `${entryName}.html`
        },
        api.config.pages[entryName]
      )

      // Generate html file for this entry
      page.template = api.resolveBaseDir(page.template)
      if (!fs.existsSync(page.template)) {
        page.template = path.join(__dirname, '../default-template.html')
      }
      config.plugin(`html-${entryName}`).use(HtmlPlugin, [page])
    }
  })
}

exports.name = 'builtin:config-app'
