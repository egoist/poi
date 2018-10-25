exports.name = 'ts-check'

exports.apply = (api, opts) => {
  api.chainWebpack(config => {
    const { dependencies = {}, devDependencies = {} } = api.pkg.data
    const enableVue = Boolean(dependencies.vue || devDependencies.vue)
    config
      .plugin('fork-ts-checker')
      .use(require('fork-ts-checker-webpack-plugin'), [
        Object.assign(
          {
            vue: enableVue,
            formatter: 'codeframe'
          },
          opts
        )
      ])
  })
}
