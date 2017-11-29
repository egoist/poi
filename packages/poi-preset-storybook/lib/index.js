const path = require('path')

module.exports = ({
  managerTemplate = path.join(__dirname, 'manager.ejs'),
  iframeTemplate = path.join(__dirname, 'iframe.ejs')
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
    const entry = [...config.entry('client').store]
    config.entryPoints.delete('client')
    const isReactHot = entry[0].indexOf('react-hot-loader/patch') > 0
    let addonsIndex = poi.options.mode === 'development' ? 2 : 1
    if (isReactHot) {
      addonsIndex++
    }
    config.entry('iframe').merge(entry.slice(0, addonsIndex))
    if (entry[addonsIndex]) {
      config.entry('manager').add(path.resolve(entry[addonsIndex]))
    }

    let manager
    try {
      manager = require.resolve('storybook-vue/lib/manager')
    } catch (err) {
      try {
        manager = require.resolve('storybook-react/lib/manager')
      } catch (err) {
        throw new Error('You have to install either storybook-vue or storybook-react!')
      }
    }
    config.entry('manager').add(manager)
  })
}
