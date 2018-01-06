const { readPkg } = require('../lib/utils')

module.exports = ctx => {
  const { options } = ctx
  const { browserslist = ['ie > 8', 'last 2 versions'] } = readPkg()

  const autoprefixerOptions = Object.assign({
    browsers: browserslist
  }, options.autoprefixer)

  let config = options.config || {}
  if (typeof config === 'function') {
    config = config(ctx)
  }
  config.plugins = config.plugins || []
  if (Array.isArray(config.plugins)) {
    config.plugins.unshift(require('autoprefixer')(autoprefixerOptions))
  } else if (typeof config.plugins === 'object') {
    config.plugins.autoprefixer = autoprefixerOptions
  }

  return config
}
