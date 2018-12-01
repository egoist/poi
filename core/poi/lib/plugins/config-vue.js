const path = require('path')
const resolveFrom = require('resolve-from')

exports.name = 'builtin:config-vue'

exports.apply = api => {
  api.hook('onCreateWebpackConfig', config => {
    const rule = config.module.rule('vue').test(/\.vue$/)

    api.webpackUtils.addCacheSupport(rule, () => {
      const vueLoaderPath = path.dirname(require.resolve('vue-loader'))
      const compilerPkg = require(resolveFrom(
        vueLoaderPath,
        '@vue/component-compiler-utils/package'
      ))
      return api.getCacheConfig('vue-loader', {
        'vue-loader': require('vue-loader/package').version,
        '@vue/component-compiler-utils': compilerPkg.version,
        'vue-template-compiler': api.localResolve(
          'vue-template-compiler/package'
        )
          ? api.localRequire('vue-template-compiler/package').version
          : null
      })
    })

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
