exports.name = 'builtin:electron'

exports.apply = (api, { bundleDependencies } = {}) => {
  if (api.config.target !== 'electron') return

  api.chainWebpack(config => {
    config.target('electron-renderer')
    const deps = Object.keys(api.pkg.data.dependencies || {})
    const depsToExclude = bundleDependencies ? [] : deps
    if (depsToExclude.length > 0) {
      const externals = config.get('externals') || []
      externals.push(
        depsToExclude.reduce((res, name) => {
          res[name] = 'commonjs ' + name
          return res
        }, {})
      )
    }

    if (api.mode === 'production') {
      config.output.publicPath('./')
    }
  })
}
