const path = require('path')
const OfflinePlugin = require('offline-plugin')

/**
 * Add offline support to your app
 * @name  offlinePreset
 * @param {Object} options
 * @param  {String} [options.entry='client'] - Specific the entry to add offline-plugin runtime file.
 * @param  {string} [options.pwa=path.join(__dirname, 'pwa.js')] - Path to your offline-plugin runtime file.
 *
 * See {@link ./pwa.js} for built-in runtime entry.
 *
 * @param  {Object} [options.pluginOptions={
    ServiceWorker: {
      events: true
    },
    AppCache: {
      events: true
    }
  }] - Options for offline-plugin.
 *
 * See {@link https://github.com/NekR/offline-plugin/blob/master/docs/options.md offline-plugin docs} for details.
 *
 * @example
 * require('poi-preset-offline')({
 *   pwa: './src/pwa.js' // Use your own runtime, relative to $cwd
 * })
 */
module.exports = ({
  entry = 'client',
  pwa = path.join(__dirname, 'pwa.js'),
  pluginOptions
} = {}) => {
  return poi => {
    poi.mode('production', () => {
      pwa = path.resolve(poi.options.cwd, pwa)
      const config = poi.webpackConfig

      if (config.entryPoints.has(entry)) {
        config.entry(entry).prepend(pwa)
      } else {
        throw new Error(`Entry "${entry}"" was not found.`)
      }

      config.plugin('offline')
        .use(OfflinePlugin, [Object.assign({
          ServiceWorker: {
            events: true
          },
          AppCache: {
            events: true
          }
        }, pluginOptions)])
    })
  }
}
