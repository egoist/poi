const nodeExternals = require('poi-webpack-node-externals')
const merge = require('lodash/merge')
const { createSet, stringifyObject } = require('./utils')

const _ = module.exports = {}

_.externalize = config => {
  let value = config.get('externals') || []
  value = value.concat([
    nodeExternals({
      whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
    }),
    'vue',
    'babel-runtime'
  ])
  config.externals(value)
}

_.getHotEntryPoints = entry => {
  if (!entry || entry === true) {
    entry = 'client'
  }
  return createSet(entry)
}

_.defineConstants = (config, vars) => {
  config.plugin('constants')
    .tap(([constants]) => [
      merge(constants, stringifyObject(vars))
    ])
}
