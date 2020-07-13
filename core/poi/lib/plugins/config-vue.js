const path = require('path')
const resolveFrom = require('resolve-from')
const logger = require('@poi/logger')
const PoiError = require('../utils/PoiError')

exports.name = 'builtin:config-vue'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const rule = config.module.rule('vue').test(/\.vue$/)

    const vueLoaderPath = path.dirname(
      api.localResolve('vue-loader/package.json') ||
        require.resolve('vue-loader/package.json')
    )
    const vueLoaderPkg = require(path.join(vueLoaderPath, 'package.json'))
    const vueLoaderMajorVersion = parseInt(vueLoaderPkg.version, 10)
    const isVue3 = vueLoaderMajorVersion >= 16

    if (isVue3 && vueLoaderPkg.version.includes('beta')) {
      logger.warn(`You are using the beta version of vue-loader, be aware!`)
    }

    const getCacheOptions = () => {
      if (isVue3) {
        const hasSFCCompiler = api.localResolve(
          '@vue/compiler-sfc/package.json'
        )
        if (!hasSFCCompiler) {
          throw new PoiError(
            `Expect @vue/compiler-sfc to be installed in current project`
          )
        }
        return api.getCacheConfig('vue-loader', {
          'vue-loader': vueLoaderPkg.version,
          '@vue/compiler-sfc': hasSFCCompiler
            ? api.localRequire('@vue/compiler-sfc/package.json').version
            : null
        })
      }

      const compilerPkg = require(resolveFrom(
        vueLoaderPath,
        '@vue/component-compiler-utils/package'
      ))
      return api.getCacheConfig('vue-loader', {
        'vue-loader': vueLoaderPkg.version,
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
      .loader(require.resolve(vueLoaderPath))
      .options(
        Object.assign(
          {
            // TODO: error with thread-loader
            compiler: isVue3
              ? undefined
              : api.localRequire('vue-template-compiler')
          },
          // For Vue templates
          api.config.cache && getCacheOptions()
        )
      )

    config.plugin('vue').use(require(vueLoaderPath).VueLoaderPlugin)
  })
}
