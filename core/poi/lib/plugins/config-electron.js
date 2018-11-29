exports.name = 'builtin:config-electron'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
    if (api.config.target !== 'electron') return

    // Force public URL
    config.output.publicPath('./')
    config.plugin('constants').tap(([options]) => [
      Object.assign(options, {
        __PUBLIC_URL__: JSON.stringify('./')
      })
    ])

    config.target('electron-renderer')
  })
}
