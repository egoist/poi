module.exports = function (options) {
  return {
    extendWebpack(config) {
      config.resolve
        .extensions
        .add('.html')

      config.module
        .rule('svelte')
        .test(/\.(html|svelte)$/)
        .use('svelte')
          .loader(require.resolve('svelte-loader'))
          .options(options)
    }
  }
}
