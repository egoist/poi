const nodeExternals = require('webpack-node-externals')
const { createSet } = require('./utils')

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

_.getHotEntryPoints = hotReload => {
  let hotEntryPoints = hotReload
  if (!hotEntryPoints || hotEntryPoints === true) {
    hotEntryPoints = 'client'
  }
  return createSet(hotEntryPoints)
}
