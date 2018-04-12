const HandleCSSLoader = require('webpack-handle-css-loader')

const LANGS = ['css', 'stylus', 'styl', 'sass', 'scss', 'less']

exports.vue = function(options) {
  const handleLoader = new HandleCSSLoader(options)
  return handleLoader.vue()
}

// Generate loaders for standalone style files (outside of .vue)
exports.standalone = function(config, options) {
  const handleLoader = new HandleCSSLoader(options)

  if (options.extract) {
    if (
      options.extractLoader &&
      options.extractLoader.indexOf('extract-text-webpack-plugin') > -1
    ) {
      config.plugin('extract-css').use(require('extract-text-webpack-plugin'), [
        {
          // https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/763
          filename: options.filename.replace('contenthash', 'hash')
        }
      ])
    } else {
      config.plugin('extract-css').use(require('mini-css-extract-plugin'), [
        {
          filename: options.filename,
          chunkFilename: options.chunkFilename
        }
      ])
    }
  }

  for (const lang of LANGS) {
    const { test, use } = handleLoader[lang]()

    const rule = config.module
      .rule(lang)
      .test(test)
      .include.add(filepath => {
        // Not ends with `.module.xxx`
        return !/\.module\.[a-z]+$/.test(filepath)
      })
      .end()

    use.forEach(use => {
      rule
        .use(use.loader)
        .loader(use.loader)
        .options(use.options)
    })
  }

  handleLoader.set('cssModules', true)

  const cssModulesLangs = LANGS.map(lang => [
    lang,
    new RegExp(`\\.module\\.${lang}`)
  ])

  for (const cssModulesLang of cssModulesLangs) {
    const [lang, test] = cssModulesLang

    const { use } = handleLoader[lang](test)
    const rule = config.module.rule(`${lang}-module`).test(test)

    use.forEach(use => {
      rule
        .use(use.loader)
        .loader(use.loader)
        .options(use.options)
    })
  }
}
