const path = require('path')

module.exports = () => poi => {
  if (!poi.argv.storybook) return

  poi.options.html = [
    {
      title: 'Manager',
      template: path.join(__dirname, 'index.ejs'),
      filename: 'index.html',
      excludeChunks: ['preview']
    },
    {
      title: 'Preview',
      template: path.join(__dirname, 'iframe.ejs'),
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
    const addonsIndex = poi.options.mode === 'development' ? 2 : 1
    config.entry('preview').merge(entry.slice(0, addonsIndex))
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
