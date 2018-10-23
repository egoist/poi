exports.name = 'eslint'

exports.extend = (api, { lintOnSave }) => {
  const command = api.registerCommand(
    'lint',
    'Lint source files',
    (input, flags) => {
      return require('./lint')(input, flags, api)
    }
  )
  command.option('fix', {
    desc: 'Fix incorrect code',
    type: 'boolean'
  })

  if (lintOnSave) {
    api.chainWebpack(config => {
      config.module
        .rule('eslint')
        .pre()
        .exclude.add(filepath => /node_modules/.test(filepath))
        // Ignore poi packages in dev mode
        .add(filepath => /\/poi\/packages\//.test(filepath))
        .end()
        .include.add(/\.(vue|(j|t)sx?)$/)
        .end()
        .use('eslint-loader')
        .loader('eslint-loader')
        .options({
          cache: true
        })
    })
  }
}
