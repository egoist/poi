exports.name = 'builtin:electron'

exports.apply = (api, { bundleDependencies } = {}) => {
  if (api.config.target !== 'electron') return

  api.chainWebpack(config => {
    config.target('electron-renderer')

    const externals = config.get('externals') || []
    externals.push((context, request, callback) => {
      const deps = Object.keys(api.pkg.data.dependencies || {})
      const depsToExclude = bundleDependencies ? [] : deps
      const shouldExclude = depsToExclude.some(dep => {
        return request.includes(`/node_modules/${dep}/`)
      })
      if (shouldExclude) {
        callback(null, `commonjs ${request}`)
      } else {
        callback()
      }
    })

    if (api.mode === 'production') {
      config.output.publicPath('./')
    }
  })
}
