module.exports = config => {
  config.module
    .rule('toml')
    .test(/\.toml$/)
    .use('toml-loader')
    .loader('toml-loader')
}
