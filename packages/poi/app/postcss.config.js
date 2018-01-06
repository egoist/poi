const { readPkg } = require('../lib/utils')

module.exports = ({ options }) => {
  const { browserslist = ['ie > 8', 'last 2 versions'] } = readPkg()

  const autoprefixerOptions = Object.assign({
    browsers: browserslist
  }, options.autoprefixer)

  const config = options.config || {}
  config.plugins = config.plugins || []
  if (Array.isArray(config.plugins)) {
    config.plugins.unshift(require('autoprefixer')(autoprefixerOptions))
  } else if (typeof config.plugins === 'object') {
    config.plugins.autoprefixer = autoprefixerOptions
  }

  return config
}
