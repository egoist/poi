exports.name = 'ts-check'

exports.apply = api => {
  api.chainWebpack(config => {
    config
      .plugin('fork-ts-checker')
      .use(require('fork-ts-checker-webpack-plugin'))
  })
}
