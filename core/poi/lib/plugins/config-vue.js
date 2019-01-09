const path = require('path')
const resolveFrom = require('resolve-from')

exports.name = 'builtin:config-vue'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const rule = config.module.rule('vue').test(/\.vue$/)

    const getCacheOptions = () => {
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
    }

    api.webpackUtils.addCacheSupport(rule, getCacheOptions)

    rule
      .use('vue-loader')
      .loader(require.resolve('vue-loader'))
      .options(
        Object.assign(
          {
            // TODO: error with thread-loader
            compiler: api.localRequire('vue-template-compiler')
          },
          // For Vue templates
          api.config.cache && getCacheOptions()
        )
      )

    config.plugin('vue').use(require('vue-loader/lib/plugin'))
  })
}
