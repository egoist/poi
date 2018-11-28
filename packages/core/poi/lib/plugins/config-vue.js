exports.name = 'builtin:config-vue'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
    const rule = config.module.rule('vue').test(/\.vue$/)

    if (api.config.cache) {
      rule
        .use('cache-loader')
        .loader('cache-loader')
        .options(
          api.getCacheConfig('vue-loader', {
            'vue-loader': require('vue-loader/package').version,
            /* eslint-disable-next-line import/no-extraneous-dependencies */
            '@vue/component-compiler-utils': require('@vue/component-compiler-utils/package')
              .version,
            'vue-template-compiler': require('vue-template-compiler/package')
              .version
          })
        )
    }

    rule
      .use('vue-loader')
      .loader('vue-loader')
      .options({
        // TODO: can't pass compiler when using thread-loader
        // compiler: compiler && require(compiler)
      })

    config.plugin('vue').use(require('vue-loader/lib/plugin'))
  })
}
