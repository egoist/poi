const ID = 'pwa-manifest-plugin'

const defaults = {
  name: 'PWA app',
  themeColor: '#74d7fd', // The Poi color
  msTileColor: '#000000',
  appleMobileWebAppCapable: 'no',
  appleMobileWebAppStatusBarStyle: 'default',
  assetsVersion: '',
  iconPaths: {
    favicon16: 'img/icons/favicon-16x16.png',
    favicon32: 'img/icons/favicon-32x32.png',
    appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
    safariMaskIcon: 'img/icons/safari-mask-icon.svg',
    msTileImage: 'img/icons/msapplication-icon-144x144.png'
  }
}

module.exports = class PwaManifestWebpackPlugin {
  constructor(options = {}, HtmlWebpackPlugin) {
    this.options = Object.assign({}, defaults, options, {
      iconPaths: Object.assign({}, defaults.iconPaths, options.iconPaths)
    })
    this.HtmlWebpackPlugin = HtmlWebpackPlugin || require('html-webpack-plugin')
  }

  apply(compiler) {
    const { HtmlWebpackPlugin } = this

    const {
      name,
      themeColor,
      msTileColor,
      appleMobileWebAppCapable,
      appleMobileWebAppStatusBarStyle,
      assetsVersion,
      iconPaths
    } = this.options

    compiler.hooks.emit.tap(ID, compilation => {
      let existing = compilation.assets['manifest.json']
      if (existing) {
        existing = existing.source()
      }

      const manifestContent = JSON.stringify(
        Object.assign(
          {
            short_name: name,
            name,
            icons: [
              iconPaths.favicon16 && {
                src: iconPaths.favicon16,
                sizes: '16x16',
                type: 'image/png'
              },
              iconPaths.favicon32 && {
                src: iconPaths.favicon32,
                sizes: '32x32',
                type: 'image/png'
              }
            ].filter(Boolean),
            start_url: '.',
            display: 'standalone',
            theme_color: themeColor,
            background_color: '#ffffff'
          },
          existing && JSON.parse(existing)
        ),
        null,
        2
      )
      compilation.assets['manifest.json'] = {
        source() {
          return manifestContent
        },
        size() {
          return manifestContent.length
        }
      }
    })

    compiler.hooks.compilation.tap(ID, compilation => {
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
        ID,
        (data, cb) => {
          const { publicPath } = compiler.options.output

          const assetsVersionStr = assetsVersion ? `?v=${assetsVersion}` : ''

          data.headTags = data.headTags.concat(
            [
              // Add to home screen for Android and modern mobile browsers
              makeTag('link', {
                rel: 'manifest',
                href: `${publicPath}manifest.json${assetsVersionStr}`
              }),
              makeTag('meta', {
                name: 'theme-color',
                content: themeColor
              }),

              // Add to home screen for Safari on iOS
              iconPaths.appleTouchIcon &&
                makeTag('meta', {
                  name: 'apple-mobile-web-app-capable',
                  content: appleMobileWebAppCapable
                }),
              iconPaths.appleTouchIcon &&
                makeTag('meta', {
                  name: 'apple-mobile-web-app-status-bar-style',
                  content: appleMobileWebAppStatusBarStyle
                }),
              iconPaths.appleTouchIcon &&
                makeTag('meta', {
                  name: 'apple-mobile-web-app-title',
                  content: name
                }),
              iconPaths.appleTouchIcon &&
                makeTag('link', {
                  rel: 'apple-touch-icon',
                  href: `${publicPath}${
                    iconPaths.appleTouchIcon
                  }${assetsVersionStr}`
                }),
              iconPaths.appleTouchIcon &&
                makeTag('link', {
                  rel: 'mask-icon',
                  href: `${publicPath}${
                    iconPaths.safariMaskIcon
                  }${assetsVersionStr}`,
                  color: themeColor
                }),

              // Add to home screen for Windows
              iconPaths.msTileImage &&
                makeTag('meta', {
                  name: 'msapplication-TileImage',
                  content: `${publicPath}${
                    iconPaths.msTileImage
                  }${assetsVersionStr}`
                }),
              iconPaths.msTileImage &&
                makeTag('meta', {
                  name: 'msapplication-TileColor',
                  content: msTileColor
                })
            ].filter(Boolean)
          )

          cb(null, data)
        }
      )
    })
  }
}

function makeTag(tagName, attributes, closeTag = false) {
  return {
    tagName,
    closeTag,
    attributes
  }
}
