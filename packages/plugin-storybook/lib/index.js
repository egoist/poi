const path = require('path')

module.exports = ({
  managerTemplate = path.join(__dirname, 'manager.ejs'),
  iframeTemplate = path.join(__dirname, 'iframe.ejs'),
  markdown: useMarkdown
} = {}) => {
  return {
    name: 'storybook',
    apply(poi) {
      const html = Array.isArray(poi.options.html)
        ? poi.options.html[0]
        : poi.options.html

      poi.options.html = [
        {
          title: html.title,
          description: html.description,
          template: managerTemplate,
          filename: 'index.html',
          chunks: ['manager', 'vendors~manager', 'vendors~iframe~manager']
        },
        {
          title: 'Iframe',
          template: iframeTemplate,
          filename: 'iframe.html',
          chunks: ['iframe', 'vendors~iframe', 'vendors~iframe~manager']
        }
      ]

      if (typeof poi.options.vue.fullBuild !== 'boolean') {
        poi.options.vue.fullBuild = true
      }

      poi.chainWebpack(config => {
        const entry = [...config.entryPoints.get('main').store]
        config.entryPoints.delete('main')
        const addonsIndex = poi.command === 'develop' ? 2 : 1
        config.entry('iframe').merge(entry.slice(0, addonsIndex))
        if (entry[addonsIndex]) {
          config.entry('manager').merge([path.resolve(entry[addonsIndex])])
        }

        config
          .entry('manager')
          .add(
            getManager([
              'storybook-vue/lib/manager',
              'storybook-react/lib/manager',
              '@storybook/vue/dist/client',
              '@storybook/react/dist/client'
            ])
          )

        if (useMarkdown !== false) {
          const markdownRule = config.module.rule('markdown').test(/\.md$/)
          markdownRule.use('html-loader').loader('html-loader')
          markdownRule.use('markdown-loader').loader('markdown-loader')
        }
      })
    }
  }
}

function getManager(names) {
  try {
    return require.resolve(names.shift())
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      if (names.length > 0) {
        return getManager(names)
      }
      throw new Error(
        `You have to install one of ${names.map(
          name => /^@?storybook[-/]\w+/.exec(name)[0]
        )}!`
      )
    } else {
      throw err
    }
  }
}
