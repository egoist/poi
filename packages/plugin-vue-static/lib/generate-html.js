const path = require('path')
const fs = require('fs-extra')
const { createBundleRenderer } = require('vue-server-renderer')
const chalk = require('chalk')

module.exports = async ({ api, staticRoutes }) => {
  const serverBundle = require(api.resolve(
    api.config.outDir,
    'server/vue-ssr-server-bundle.json'
  ))
  const clientManifest = require(api.resolve(
    api.config.outDir,
    'client/vue-ssr-client-manifest.json'
  ))
  const template = await fs.readFile(
    api.resolve(api.config.outDir, 'client/index.html'),
    'utf8'
  )
  const renderer = createBundleRenderer(serverBundle, {
    clientManifest,
    runInNewContext: false,
    inject: false,
    basedir: api.resolve()
  })
  const outDir = api.resolve(api.config.outDir, '__generated')
  await fs.copy(api.resolve(api.config.outDir, 'client'), outDir)
  await Promise.all([
    fs.remove(api.resolve(api.config.outDir, 'server')),
    fs.remove(api.resolve(api.config.outDir, 'client'))
  ])
  await Promise.all(
    staticRoutes.map(async route => {
      const context = { url: route }
      api.logger.debug(`Rendering ${route}...`)
      const app = await renderer.renderToString(context)
      const {
        title,
        htmlAttrs,
        bodyAttrs,
        link,
        style,
        script,
        noscript,
        meta
      } = context.meta.inject()
      const html = template
        .replace('{app}', () => {
          if (route === '/app-shell.html') {
            return `<div id="app"></div>`
          }
          return app
        })
        .replace('{title}', title.text())
        .replace('{htmlAttrs}', htmlAttrs.text())
        .replace('{bodyAttrs}', bodyAttrs.text())
        .replace('{link}', link.text())
        .replace('{style}', style.text())
        .replace('{script}', script.text())
        .replace('{noscript}', noscript.text())
        .replace('{meta}', meta.text())
        .replace(
          '{head}',
          title.text() + meta.text() + link.text() + style.text()
        )
        .replace('{styles}', () => context.renderStyles())
        .replace('{globalState}', () => context.renderState())
        .replace('{scripts}', () => context.renderScripts())
        .replace('{resourceHints}', () => context.renderResourceHints())
      const outPath = routeToFilePath(route, outDir)
      api.logger.debug(`Writing ${outPath}...`)
      await fs.ensureDir(path.dirname(outPath))
      await fs.writeFile(outPath, html, 'utf8')
    })
  )
  api.logger.debug(`Coping generated static files to out directory...`)
  await fs.copy(outDir, api.resolve(api.config.outDir))
  api.logger.debug('Clean up...')
  await fs.remove(
    api.resolve(api.config.outDir, 'vue-ssr-client-manifest.json')
  )
  await fs.remove(outDir)
  api.logger.success(
    `Done! Generated into ${chalk.bold.underline(
      path.relative(process.cwd(), api.resolve(api.config.outDir))
    )}`
  )
}

function routeToFilePath(route, outDir) {
  route = path.join(outDir, route)
  if (route.endsWith('.html')) {
    return route
  }
  return route.replace(/\/?$/, '/index.html')
}
