exports.name = 'builtin:yarn-pnp'

exports.when = api =>
  api.pkg.data.installConfig && api.pkg.data.installConfig.pnp

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const { apply, moduleLoader } = require('@poi/pnp-webpack-plugin')

    config.resolve.plugin('pnp').use(
      class PnpWebpackPlugin {
        apply(...args) {
          return apply(...args)
        }
      }
    )

    config.resolveLoader.plugin('pnp').use(
      class PnpWebpackPlugin {
        apply(...args) {
          return moduleLoader(module).apply(...args)
        }
      }
    )
  })
}
