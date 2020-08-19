exports.name = 'builtin:config-react-refresh'

exports.when = api =>
  api.hasDependency('react') &&
  api.hasDependency('react-dom') &&
  process.env.NODE_ENV === 'development'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const reactRefresh = require('@pmmmwh/react-refresh-webpack-plugin')
    config.plugin('@pmmmwh/react-refresh-webpack-plugin').use(reactRefresh)
  })
}
