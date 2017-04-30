const HandleCSSLoader = require('webpack-handle-css-loader')

const LANGS = ['css', 'stylus', 'styl', 'sass', 'scss', 'less']

exports.vue = function (options) {
  // vue-loader has postcss built-in
  // so here we don't need to add a postcss-loader
  options = Object.assign({}, options, { postcss: false })
  const handleLoader = new HandleCSSLoader(options)
  const result = {}
  for (const lang of LANGS) {
    result[lang] = handleLoader[lang]().use
  }
  return result
}

// Generate loaders for standalone style files (outside of .vue)
exports.standalone = function (config, options) {
  const handleLoader = new HandleCSSLoader(options)
  for (const lang of LANGS) {
    const rule = handleLoader[lang]()
    const context = config.module
      .rule(lang)
      .test(rule.test)

    rule.use.forEach(use => {
      context
        .use(use.loader)
          .loader(use.loader)
          .options(use.options)
    })
  }
}
