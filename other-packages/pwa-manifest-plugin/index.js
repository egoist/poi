const fs = require('fs')

const ID = 'pwa-manifest-plugin'

const defaults = {
  name: 'PWA app',
  themeColor: '#74d7fd', // The Poi color
  msTileColor: '#000000',
  appleMobileWebAppCapable: 'no',
  appleMobileWebAppStatusBarStyle: 'default',
  assetsVersion: ''
  // manifestPath: 'public/manifest.json'
}

const defaultIconPaths = {
  appleTouchIcon: 'img/icons/apple-touch-icon-152x152.png',
  maskIcon: 'img/icons/safari-pinned-tab.svg',
  msTileImage: 'img/icons/msapplication-icon-144x144.png'
}

module.exports = class HtmlPwaPlugin {
  constructor(options = {}, HtmlPwaPlugin) {
    const iconPaths = Object.assign({}, defaultIconPaths, options.iconPaths)
    delete options.iconPaths
    this.options = Object.assign({ iconPaths }, defaults, options)
    this.HtmlPwaPlugin = HtmlPwaPlugin || require('html-webpack-plugin')
  }

  apply(compiler) {
    const { HtmlPwaPlugin } = this

    const {
      name,
      themeColor,
      msTileColor,
      appleMobileWebAppCapable,
      appleMobileWebAppStatusBarStyle,
      assetsVersion,
      manifestPath,
      iconPaths
    } = this.options

    if (manifestPath) {
      compiler.hooks.done.tapAsync(ID, (_, cb) => {
        if (fs.existsSync(manifestPath)) return cb()

        fs.writeFile(
          manifestPath,
          JSON.stringify(
            {
              short_name: name,
              name,
              icons: [
                {
                  src: 'favicon.ico',
                  sizes: '64x64 32x32 24x24 16x16',
                  type: 'image/x-icon'
                }
              ],
              start_url: '.',
              display: 'standalone',
              theme_color: themeColor,
              background_color: '#ffffff'
            },
            null,
            2
          ),
          'utf8',
          cb
        )
      })
    }

    compiler.hooks.compilation.tap(ID, compilation => {
      HtmlPwaPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync(
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
                  href: `${publicPath}${iconPaths.maskIcon}${assetsVersionStr}`,
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
