const nodeExternals = require('poi-webpack-node-externals')

module.exports = (config, format) => {
  return format === 'cjs'
    ? [
        nodeExternals({
          whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
        }),
        'vue',
        'babel-runtime'
      ]
    : []
}
