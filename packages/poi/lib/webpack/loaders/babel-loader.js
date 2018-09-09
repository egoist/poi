const babelLoader = require('babel-loader')
const logger = require('@poi/cli-utils/logger')

module.exports = babelLoader.custom(babel => {
  const configs = new Set()
  const babelPresetItem = babel.createConfigItem(
    require.resolve('../../babel/preset'),
    {
      type: 'preset'
    }
  )

  return {
    customOptions(opts) {
      const custom = opts.customLoaderOptions
      delete opts.customLoaderOptions

      return { loader: opts, custom }
    },
    config(
      cfg,
      {
        // customOptions is not used for now
        customOptions // eslint-disable-line no-unused-vars
      }
    ) {
      const options = Object.assign({}, cfg.options)

      if (cfg.hasFilesystemConfig()) {
        for (const file of [cfg.babelrc, cfg.config]) {
          if (file && !configs.has(file)) {
            configs.add(file)
            logger.debug(`Using external babel config file: ${file}`)
          }
        }
      } else {
        // Add our default preset
        options.presets = [babelPresetItem, ...options.presets]
      }

      return options
    }
  }
})
