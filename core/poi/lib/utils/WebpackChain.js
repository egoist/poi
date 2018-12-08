const Chain = require('webpack-chain')
const merge = require('webpack-merge')

module.exports = class WebpackChain extends Chain {
  constructor({ configureWebpack, opts }) {
    super()
    this.configureWebpack = configureWebpack
    this.opts = opts
  }

  toConfig() {
    let config = super.toConfig()
    if (typeof this.configureWebpack === 'function') {
      config = this.configureWebpack(config, this.opts) || config
    } else if (typeof this.configureWebpack === 'object') {
      config = merge({}, config, this.configureWebpack)
    }
    return config
  }

  toString(options) {
    return Chain.toString(this.toConfig(), options)
  }
}
