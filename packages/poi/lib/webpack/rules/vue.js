const resolveFrom = require('resolve-from')

module.exports = (config, { baseDir }) => {
  const { VueLoaderPlugin } = require('vue-loader')
  VueLoaderPlugin.__expression = `require('vue-loader').VueLoaderPlugin`
  config.plugin('vue').use(VueLoaderPlugin)

  const templateCompilerPath = resolveFrom.silent(
    baseDir,
    'vue-template-compiler'
  )
  config.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue-loader')
    .loader('vue-loader')
    .options({
      compiler: templateCompilerPath && require(templateCompilerPath)
    })
}
