module.exports = config => {
  // prettier-ignore
  config.module
    .rule('pug')
    .test(/\.pug$/)
      .oneOf('vue')
        .resourceQuery(/^\?vue/)
        .use('pug-plain-loader')
          .loader('pug-plain-loader')
          .end()
        .end()
      .oneOf('normal')
        .use('pug-loader')
          .loader('pug-loader')
          .end()
}
