exports.name = 'builtin:yarn-pnp'

exports.when = api =>
  api.pkg.data.installConfig && api.pkg.data.installConfig.pnp

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const PnpWebpackPlugin = require('@poi/pnp-webpack-plugin')

    config.merge({
      resolve: {
        plugins: [PnpWebpackPlugin]
      },
      resolveLoader: {
        plugins: [PnpWebpackPlugin.moduleLoader(module)]
      }
    })
  })
}
