const path = require('path')
const fs = require('fs-extra')
const { createBundleRenderer } = require('vue-server-renderer')

const handleRoute = route => {
  if (route.endsWith('.html')) {
    return route
  }
  return route.replace(/\/?$/, '/index.html')
}

module.exports = async (routes, outDir) => {
  const serverBundle = JSON.parse(
    fs.readFileSync(
      path.resolve('.vue-static/server/vue-ssr-server-bundle.json'),
      'utf8'
    )
  )
  const clientManifest = JSON.parse(
    fs.readFileSync(
      path.resolve('.vue-static/client/vue-ssr-client-manifest.json'),
      'utf8'
    )
  )
  const renderer = createBundleRenderer(serverBundle, {
    basedir: process.cwd(),
    runInNewContext: true,
    clientManifest,
    template: fs.readFileSync(
      path.join(__dirname, '../app/index.template.html'),
      'utf8'
    ),
    inject: false
  })
  await fs.move('.vue-static/client', outDir)
  await Promise.all(
    routes.map(async route => {
      const context = { url: route, state: {} }
      const html = await renderer.renderToString(context)
      const outFile = path.join(outDir, handleRoute(route))
      await fs.ensureDir(path.dirname(outFile))
      await fs.writeFile(outFile, html, 'utf8')
    })
  )
  await fs.remove('.vue-static')
}
