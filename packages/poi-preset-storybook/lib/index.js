const path = require('path')

module.exports = ({
  managerTemplate = path.join(__dirname, 'manager.ejs'),
  iframeTemplate = path.join(__dirname, 'iframe.ejs'),
  markdown: useMarkdown
} = {}) => poi => {
  if (!poi.argv.storybook) return

  const html = Array.isArray(poi.options.html) ? poi.options.html[0] : poi.options.html
  poi.options.html = [
    {
      title: html.title,
      description: html.description,
      template: managerTemplate,
      filename: 'index.html',
      excludeChunks: ['iframe']
    },
    {
      title: 'Iframe',
      template: iframeTemplate,
      filename: 'iframe.html',
      excludeChunks: ['manager']
    }
  ]

  if (typeof poi.options.templateCompiler !== 'boolean') {
    poi.options.templateCompiler = true
  }

  poi.extendWebpack(config => {
    const entry = config.get('entry.client')
    config.delete('entry.client')
    const isReactHot = entry[0].indexOf('react-hot-loader/patch') > 0
    let addonsIndex = poi.options.mode === 'development' ? 2 : 1
    if (isReactHot) {
      addonsIndex++
    }
    config.set('entry.iframe', entry.slice(0, addonsIndex))
    if (entry[addonsIndex]) {
      config.set('entry.manager', [path.resolve(entry[addonsIndex])])
    }

    config.append('entry.manager', getManager([
      'storybook-vue/lib/manager',
      'storybook-react/lib/manager',
      '@storybook/vue/dist/client/manager',
      '@storybook/react/dist/client/manager'
    ]))

    if (useMarkdown !== false) {
      const markdownRule = config.rules.add('markdown', {
        test: /\.md$/
      })
      markdownRule.loaders.add('html-loader', {
        loader: 'html-loader'
      })
      markdownRule.loaders.add('markdown-loader', {
        loader: 'markdown-loader'
      })
    }
  })
}

function getManager(names) {
  try {
    return require.resolve(names.shift())
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      if (names.length > 0) {
        return getManager(names)
      }
      throw new Error(`You have to install one of ${names.map(name => /^@?storybook[-/]\w+/.exec(name)[0])}!`)
    } else {
      throw err
    }
  }
}
