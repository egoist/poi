const path = require('path')

module.exports = ({
  client = 'vue'
} = {}) => poi => {
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

  // console.log(`> Using ".storybook/config.js" as entry`)
  // poi.options.entry = path.resolve('.storybook/config.js')
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
    config.entry('manager').add(require.resolve(`storybook-${client}/lib/manager`))
  })
}
