exports.name = 'builtin:config-electron'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
    if (api.config.target !== 'electron') return

    // Force public URL
    config.output.publicPath('./')
    config.plugin('envs').tap(([options]) => [
      Object.assign(options, {
        PUBLIC_URL: JSON.stringify('./')
      })
    ])

    config.target('electron-renderer')
  })
}
