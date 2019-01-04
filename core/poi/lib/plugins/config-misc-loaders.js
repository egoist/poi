exports.name = 'builtin:config-misc-loaders'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    // GraphQL
    config.module
      .rule('graphql')
      .test(/\.(graphql|gql)$/)
      .use('graphql-tag')
      .loader('graphql-tag/loader')

    config.module
      .rule('toml')
      .test(/\.toml$/)
      .use('toml-loader')
      .loader('toml-loader')

    config.module
      .rule('yaml')
      .test(/\.ya?ml$/)
      .merge({
        type: 'json'
      })
      .use('yaml-loader')
      .loader('yaml-loader')

    // prettier-ignore
    config.module
      .rule('pug')
      .test([/\.pug$/, /\.jade$/])
      // Pug inside Vue template is loaded as raw string
      .oneOf('vue-template')
        .resourceQuery(/^\?vue/)
        .use('pug-plain-loader')
          .loader('pug-plain-loader')
          .end()
        .end()
      // Pug inside js file is loaded as a compiled function
      .oneOf('normal')
        .use('pug-loader')
        .loader('pug-loader')
  })
}
