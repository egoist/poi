const path = require('path')
const {
  ProgressPlugin: WebpackProgressPlugin
} = require('@poi/create-webpack-config/webpack')
const logger = require('@poi/logger')

const prettyPath = p => path.relative(process.cwd(), p)

module.exports = class ProgressPlugin extends WebpackProgressPlugin {
  constructor() {
    super((percent, msg, ...details) => {
      if (msg) {
        let modulePath = details[details.length - 1] || ''
        if (modulePath) {
          modulePath = prettyPath(modulePath)
        }
        logger.progress(`${Math.floor(percent * 100)}% ${msg} ${modulePath}`)
      }
    })
  }
}
