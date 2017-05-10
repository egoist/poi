const nodeExternals = require('webpack-node-externals')

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
