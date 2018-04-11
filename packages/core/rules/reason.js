module.exports = config => {
  // prettier-ignore
  config.module.rule('reason')
    .test(/\.(re|ml)$/)
    .exclude
      .add(/node_modules/)
      .end()
    .use('bs-loader')
      .loader('@poi/bs-loader')
}
