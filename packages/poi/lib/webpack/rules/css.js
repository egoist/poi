const logger = require('@poi/cli-utils/logger')
const loadConfig = require('../../utils/load-config')

module.exports = (config, api) => {
  const { loaderOptions, extract } = api.config.css
  const shouldExtract = extract
  const sourceMap = Boolean(api.config.sourceMap)

  const hasPostCSSConfig = loadConfig.resolveSync({
    files: [
      'postcss.config.js',
      'package.json',
      '.postcssrc',
      '.postcssrc.js',
      '.postcssrc.yaml',
      '.postcssrc.json'
    ],
    packageKey: 'postcss',
    cwd: api.options.baseDir
  })

  if (hasPostCSSConfig) {
    logger.debug('Applying custom PostCSS config at ' + hasPostCSSConfig)
  }

  // if building for production but not extracting CSS, we need to minimize
  // the embbeded inline CSS as they will not be going through the optimizing
  // plugin.
  const needInlineMinification = api.config.minimize && !shouldExtract

  const cssnanoOptions = {
    safe: true,
    autoprefixer: { disable: true },
    mergeLonghand: false
  }
  if (sourceMap) {
    cssnanoOptions.map = { inline: false }
  }

  const extractOptions = {
    filename: api.config.filenames.css,
    chunkFilename: api.config.filenames.chunk.replace(/\.js$/, '.css')
  }

  const createCSSRule = (lang, test, loader, options) => {
    const applyLoaders = (rule, modules) => {
      if (shouldExtract) {
        rule
          .use('extract-css-loader')
          .loader(require('mini-css-extract-plugin').loader)
      } else {
        rule
          .use('vue-style-loader')
          .loader('vue-style-loader')
          .options({
            sourceMap
          })
      }

      const cssLoaderOptions = Object.assign(
        {
          sourceMap,
          modules,
          localIdentName: '[path][name]__[local]--[hash:base64:5]',
          importLoaders:
            1 + // stylePostLoader injected by vue-loader
            (hasPostCSSConfig ? 1 : 0) +
            (needInlineMinification ? 1 : 0)
        },
        loaderOptions.css
      )

      rule
        .use('css-loader')
        .loader('css-loader')
        .options(cssLoaderOptions)

      if (needInlineMinification) {
        rule
          .use('minify-inline-css')
          .loader('postcss-loader')
          .options({
            plugins: [
              // eslint-disable-next-line import/no-extraneous-dependencies
              require('cssnano')(cssnanoOptions)
            ]
          })
      }

      if (hasPostCSSConfig) {
        rule
          .use('postcss-loader')
          .loader('postcss-loader')
          .options(Object.assign({ sourceMap }, loaderOptions.postcss))
      }

      if (loader) {
        rule
          .use(loader)
          .loader(loader)
          .options(Object.assign({ sourceMap }, options))
      }
    }

    const baseRule = config.module.rule(lang).test(test)

    // rules for <style lang="module">
    const vueModulesRule = baseRule.oneOf('vue-modules').resourceQuery(/module/)
    applyLoaders(vueModulesRule, true)

    // rules for <style>
    const vueNormalRule = baseRule.oneOf('vue').resourceQuery(/\?vue/)
    applyLoaders(vueNormalRule, false)

    // rules for *.module.* files
    const extModulesRule = baseRule
      .oneOf('normal-modules')
      .test(/\.module\.\w+$/)
    applyLoaders(extModulesRule, true)

    // rules for normal CSS imports
    const normalRule = baseRule.oneOf('normal')
    applyLoaders(normalRule, false)
  }

  if (shouldExtract) {
    config
      .plugin('extract-css')
      .use(require('mini-css-extract-plugin'), [extractOptions])

    const OptimizeCSSPlugin = require('@intervolga/optimize-cssnano-plugin')
    config.plugin('optimize-css').use(OptimizeCSSPlugin, [
      {
        sourceMap,
        cssnanoOptions
      }
    ])
  }

  createCSSRule('css', /\.css$/)
  createCSSRule('postcss', /\.p(ost)?css$/)
  createCSSRule('scss', /\.scss$/, 'sass-loader', loaderOptions.sass)
  createCSSRule(
    'sass',
    /\.sass$/,
    'sass-loader',
    Object.assign(
      {
        indentedSyntax: true
      },
      loaderOptions.sass
    )
  )
  createCSSRule('less', /\.less$/, 'less-loader', loaderOptions.less)
  createCSSRule(
    'stylus',
    /\.styl(us)?$/,
    'stylus-loader',
    Object.assign(
      {
        preferPathResolver: 'webpack'
      },
      loaderOptions.stylus
    )
  )
}
