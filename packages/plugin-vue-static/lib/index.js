const path = require('path')
const fs = require('fs-extra')
const ClientPlugin = require('vue-server-renderer/client-plugin')
const ServerPlugin = require('vue-server-renderer/server-plugin')
const { createBundleRenderer } = require('vue-server-renderer')
const merge = require('webpack-merge')

exports.name = 'vue-static'

exports.extend = api => {
  // Define default constants for non-generate commands
  if (!api.isCommand('generate')) {
    Object.assign(api.config.constants, {
      'process.server': false,
      'process.browser': true
    })
  }

  api.registerCommand('generate', 'Generate static pages', async (input, flags) => {
    const oldClientConfig = api.createWebpackConfig({ type: 'client' })
    const oldServerConfig = api.createWebpackConfig({ type: 'server' })
    const userEntry = oldClientConfig.entry.index[0]
    const clientOutDir = api.resolveBaseDir('.vue-static/client')
    const serverOutDir = api.resolveBaseDir('.vue-static/server')
    const clientConfig = merge(oldClientConfig, {
      entry: {
        index: [path.join(__dirname, '../app/client-entry.js')]
      },
      output: {
        path: clientOutDir,
      },
      plugins: [
        new ClientPlugin()
      ],
      resolve: {
        alias: {
          '#user-entry$': userEntry
        }
      }
    })
    const serverConfig = merge(oldServerConfig, {
      entry: {
        index: [path.join(__dirname, '../app/server-entry.js')]
      },
      output: {
        libraryTarget: 'commonjs2',
        path: serverOutDir
      },
      target: 'node',
      externals: [
        require('webpack-node-externals')({
          whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
        })
      ],
      plugins: [
        new ServerPlugin()
      ],
      resolve: {
        alias: {
          '#user-entry$': userEntry
        }
      }
    })

    await Promise.all([
      api.bundle(clientConfig),
      api.bundle(serverConfig)
    ])

    const serverBundle = require(path.join(serverOutDir, 'vue-ssr-server-bundle.json'))
    const renderer = createBundleRenderer(serverBundle, {
      runInNewContext: true,
      inject: false,
      basedir: api.resolveBaseDir()
    })
    const routes = ['/']
    const template = await fs.readFile(path.join(clientOutDir, 'index.html'), 'utf8')
    await fs.remove(oldClientConfig.output.path)
    await fs.copy(clientOutDir, oldClientConfig.output.path)
    
    await Promise.all(routes.map(async route => {
      const context = { url: route, state: {} }
      const app = await renderer.renderToString(context)
      const html = generateHTML(app, template, context)
      const outPath = api.resolveBaseDir(`dist${getFilename(route)}`)
      await fs.ensureDir(path.dirname(outPath))
      await fs.writeFile(outPath, html, 'utf8')
    }))

    await Promise.all([
      fs.remove(api.resolveBaseDir('.vue-static')),
      fs.remove(path.join(oldClientConfig.output.path, 'vue-ssr-client-manifest.json'))
    ])
  })
}

function generateHTML(app, template, context) {
  let html = template.replace(/<div id="app"><\/div>/, app)
    .replace(/<\/head>/, `${context.renderStyles()}</head>`)
    .replace(/<\/body>/, `<script>window.__INITIAL_STATE__=${context.renderState()}</script>\n${context.renderScripts()}</body>`)

  if (context.meta) {
    const {
      title, htmlAttrs, bodyAttrs, link, style, script, noscript, meta
    } = context.meta.inject()
    html = html.replace(/<\/head>/, `${meta.text()}
    ${title.text()}
    ${link.text()}
    ${style.text()}
    ${script.text()}
    ${noscript.text()}</head>`)
    .replace(/<html(.*)>/, `<html$1 ${htmlAttrs.text()}>`)
    .replace(/<body(.*)>/, `<body$1 ${bodyAttrs.text()}>`)
  }

  return html
}

function getFilename(route) {
  if (route.endsWith('.html')) return route
  return route.replace(/\/?$/, '/index.html')
}