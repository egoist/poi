const nodeExternals = require('webpack-node-externals')

module.exports = ({ format, excludeNodeModules }) => {
  return format === 'cjs' || excludeNodeModules
    ? [
        nodeExternals({
          whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
        })
      ]
    : []
}
