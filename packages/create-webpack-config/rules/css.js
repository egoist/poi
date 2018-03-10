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
    config.plugins.add('extract-css', require('mini-css-extract-plugin'), [
      {
        filename: options.filename,
        chunkFilename: options.chunkFilename
      }
    ])
  }

  for (const lang of LANGS) {
    const { test, use } = handleLoader[lang]()

    const rule = config.rules.add(lang, {
      test,
      include: filepath => {
        // Not ends with `.module.xxx`
        return !/\.module\.[a-z]+$/.test(filepath)
      }
    })

    use.forEach(use => {
      rule.loaders.add(use.loader, use)
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
    const rule = config.rules.add(`${lang}-module`, {
      test
    })

    use.forEach(use => {
      rule.loaders.add(use.loader, use)
    })
  }
}
