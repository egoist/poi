const path = require('path')
const OfflinePlugin = require('offline-plugin')

module.exports = ({
  entry = 'main',
  pwa = path.join(__dirname, 'pwa.js'),
  pluginOptions
} = {}) => {
  return {
    name: 'offline',
    command: 'build',
    apply(poi) {
      poi.chainWebpack(config => {
        pwa = path.resolve(poi.options.cwd, pwa)

        if (config.entryPoints.has(entry)) {
          config.entry(entry).prepend(pwa)
        } else {
          throw new Error(`Entry "${entry}" was not found.`)
        }

        // Our default pwa entry is written in ES2015
        // So we need to include in babel transformation process
        config.module.rule('js').include.add(pwa)

        config.plugin('offline').use(OfflinePlugin, [
          Object.assign(
            {
              ServiceWorker: {
                events: true,
                navigateFallbackURL: '/'
              },
              AppCache: {
                events: true,
                FALLBACK: { '/': '/' }
              }
            },
            pluginOptions
          )
        ])
      })
    }
  }
}
