const HandleCSSLoader = require('webpack-handle-css-loader')

const LANGS = ['css', 'stylus', 'styl', 'sass', 'scss', 'less']

exports.vue = function (options) {
  const handleLoader = new HandleCSSLoader(options)
  return handleLoader.vue()
}

// Generate loaders for standalone style files (outside of .vue)
exports.standalone = function (config, options) {
  const handleLoader = new HandleCSSLoader(options)

  for (const lang of LANGS) {
    const rule = handleLoader[lang]()
    const context = config.module
      .rule(lang)
      .test(rule.test)
      .include
        .add(filepath => {
          // Not ends with `.module.xxx`
          return !/\.module\.[a-z]+$/.test(filepath)
        })
        .end()

    rule.use.forEach(use => {
      context
        .use(use.loader)
          .loader(use.loader)
          .options(use.options)
    })
  }

  handleLoader.set('cssModules', true)

  const cssModulesLangs = LANGS.map(lang => [lang, new RegExp(`\\.module\\.${lang}`)])

  for (const cssModulesLang of cssModulesLangs) {
    const [lang, test] = cssModulesLang

    const rule = handleLoader[lang](test)
    const context = config.module
      .rule(`${lang}-module`)
      .test(rule.test)

    rule.use.forEach(use => {
      context
        .use(use.loader)
          .loader(use.loader)
          .options(use.options)
    })
  }
}
