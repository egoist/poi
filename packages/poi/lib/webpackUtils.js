const nodeExternals = require('poi-webpack-node-externals')
const merge = require('lodash/merge')
const createSet = require('./utils/createSet')
const stringifyObject = require('poi-webpack-utils/helpers/stringifyObject')

const _ = (module.exports = {})

_.externalize = config => {
  let value = config.get('externals') || []
  value = value.concat([
    nodeExternals({
      whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
    }),
    'vue',
    'babel-runtime'
  ])
  config.set('externals', value)
}

_.getHotEntryPoints = entry => {
  if (!entry || entry === true) {
    entry = 'main'
  }
  return createSet(entry)
}

_.defineConstants = (config, vars) => {
  config.plugins.update('constants', ([constants]) => [
    merge(constants, stringifyObject(vars))
  ])
}
