const path = require('path')
const fs = require('fs-extra')
const { createBundleRenderer } = require('vue-server-renderer')
const { minify } = require('html-minifier')

module.exports = async (
  api,
  { staticRoutes, serverBundle, clientManifest, htmlSkeletion, resourceHints }
) => {
  const routes = [...new Set(['/'].concat(staticRoutes || []))]
  const renderer = createBundleRenderer(serverBundle, {
    clientManifest,
    runInNewContext: false,
    inject: false,
    basedir: api.resolveCwd()
  })

  const generatePage = async route => {
    const context = { url: route }
    const app = await renderer.renderToString(context)
    const {
      title,
      htmlAttrs,
      headAttrs,
      bodyAttrs,
      link,
      style,
      script,
      noscript,
      meta
    } = context.meta.inject()

    const html = htmlSkeletion
      .replace(
        /<title>.*<\/title>/,
        () => `
    ${meta.text()}
    ${title.text()}
    ${link.text()}
    ${context.renderStyles()}
    ${style.text()}
    ${script.text()}
    ${noscript.text()}
    ${resourceHints ? context.renderResourceHints() : ''}
    `
      )
      .replace(
        /<html(\s+)?(.*)>/,
        `<html data-poi-ssr ${htmlAttrs.text()}$1$2>`
      )
      .replace(/<head(\s+)?(.*)>/, `<head ${headAttrs.text()}$1$2>`)
      .replace(/<body(\s+)?(.*)>/, `<body ${bodyAttrs.text()}$1$2>`)
      .replace(
        '</body>',
        `${context.renderState()}${context.renderScripts()}</body>`
      )
      .replace(`<div id="app"></div>`, app)
    const outPath = getFilePath(api.resolveOutDir(), route)
    console.log(`> Rendering ${route}`)
    await fs.outputFile(
      outPath,
      minify(html, {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true
      }),
      'utf8'
    )
  }

  await Promise.all(routes.map(route => generatePage(route)))
}

function getFilePath(outDir, route) {
  if (!route.endsWith('.html')) {
    route = route.replace(/(\/)?$/, '/index.html')
  }

  return path.join(outDir, route)
}
