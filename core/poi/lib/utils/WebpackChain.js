const Chain = require('webpack-chain')
const merge = require('webpack-merge')

module.exports = class WebpackChain extends Chain {
  constructor({ configureWebpack }) {
    super()
    this.configureWebpack = configureWebpack
  }

  toConfig() {
    let config = super.toConfig()
    if (typeof this.configureWebpack === 'function') {
      config = this.configureWebpack(config) || config
    } else if (typeof this.configureWebpack === 'object') {
      config = merge(config, this.configureWebpack)
    }
    return config
  }

  toString(options) {
    return Chain.toString(this.toConfig(), options)
  }
}
