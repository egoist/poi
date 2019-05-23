const babelLoader = require('babel-loader')
const logger = require('@poi/logger')
const spinner = require('../utils/spinner')

const macroCheck = new RegExp('[./]macro')

module.exports = babelLoader.custom(babel => {
  const configs = new Set()
  const presetItem = babel.createConfigItem(require('../babel/preset'), {
    type: 'preset'
  })

  return {
    customOptions(opts) {
      const custom = opts.customLoaderOptions
      delete opts.customLoaderOptions

      return { loader: opts, custom }
    },
    config(cfg, { source }) {
      const options = Object.assign({}, cfg.options, {
        caller: Object.assign({}, cfg.options.caller, {
          // for babel-plugin-macros it should never be cached
          poiInvalidationToken: macroCheck.test(source)
            ? require('crypto')
                .randomBytes(32)
                .toString('hex')
            : ''
        })
      })

      if (cfg.hasFilesystemConfig()) {
        for (const file of [cfg.babelrc, cfg.config]) {
          if (file && !configs.has(file)) {
            configs.add(file)
            spinner.stop()
            logger.debug(`Using external babel config file: ${file}`)
          }
        }
      } else {
        // Add our default preset if the no "babelrc" found.
        options.presets = [...options.presets, presetItem]
      }

      return options
    }
  }
})
