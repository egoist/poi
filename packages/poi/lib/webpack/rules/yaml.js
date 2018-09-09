module.exports = config => {
  config.module
    .rule('yaml')
    .test(/\.ya?ml$/)
    .merge({
      type: 'json'
    })
    .use('yaml-loader')
    .loader('yaml-loader')
}
