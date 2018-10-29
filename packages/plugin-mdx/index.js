exports.name = 'mdx'

exports.apply = api => {
  api.chainWebpack(config => {
    const test = config.module.rule('js').get('test')
    config.module.rule('js').test([/\.mdx$/].concat(test))

    config.module
      .rule('mdx')
      .pre()
      .test(/\.mdx$/)
      .use('mdx')
      .loader('@mdx-js/loader')
  })
}
