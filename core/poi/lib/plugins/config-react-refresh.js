exports.name = 'builtin:config-react-refresh'

exports.cli = ({ command }) => {
  command.option('--react-refresh', 'Enable React Refresh')
}

exports.when = api => api.config.reactRefresh && api.mode === 'development'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    process.env.POI_REACT_REFRESH = api.hasDependency('react')

    config
      .plugin('react-refresh')
      .use(require('@pmmmwh/react-refresh-webpack-plugin'), [
        {
          overlay: {
            entry: require.resolve('@poi/dev-utils/hotDevClient'),
            // The expected exports are slightly different from what the overlay exports,
            // so an interop is included here to enable feedback on module-level errors.
            module: require.resolve('@poi/dev-utils/refreshOverlayInterop'),
            // Since we ship a custom dev client and overlay integration,
            // the bundled socket handling logic can be eliminated.
            sockIntegration: false
          }
        }
      ])
  })
}
