const path = require('path')
const fs = require('fs-extra')
const { collectRoutes, renderRoutes } = require('@ream/collect-fs-routes')
const formatWebpackMessages = require('@poi/dev-utils/formatWebpackMessages')

exports.name = 'vue-static'

exports.apply = (api, { staticRoutes: userStaticRoutes = [] } = {}) => {
  const cacheDir = api.resolve('node_modules/.cache/vue-static')

  if (api.options.command === 'generate') {
    api.config.ssr = true
    // Use a different default template file for generating index.html
    api.config.defaultHtmlTemplate = fs.existsSync(
      api.resolve('public/index.static.html')
    )
      ? api.resolve('public/index.static.html')
      : path.join(__dirname, '../app/index.static.html')
    // Do not inject webpack assets in index.html
    api.config.html = Object.assign({}, api.config.html, {
      inject: false
    })
  }

  api.chainWebpack((config, { type }) => {
    const entry = [...config.entry('index').store]
    config.entry('index').clear()

    config.resolve.alias
      .set('#pages', api.resolve('pages'))
      .set('#original-entry$', entry[0])
      .set('#vue-static-cache', cacheDir)
    config.module.rule('js').include.add(path.join(__dirname, '../app'))

    config.plugin('constants').tap(([options]) => [
      Object.assign({}, options, {
        'process.server': JSON.stringify(type === 'server'),
        'process.client': JSON.stringify(type === 'client')
      })
    ])

    if (api.options.command === 'generate') {
      config.output.path(path.join(config.output.get('path'), type))
      config.plugins.delete('report-status')
    }

    if (type === 'server') {
      config.entryPoints.delete('index')
      config.entry('server').add(path.join(__dirname, '../app/server-entry'))
      config.target('node')
      config.output.libraryTarget('commonjs2')
      config.plugin('vue-ssr').use(require('vue-server-renderer/server-plugin'))
      config.externals([
        require('webpack-node-externals')({
          // load non-javascript files with extensions, presumably via loaders
          whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
        })
      ])
      config.optimization.splitChunks(false)
    } else if (type === 'client') {
      config.entry('index').add(path.join(__dirname, '../app/client-entry'))
      if (api.options.command === 'generate') {
        config
          .plugin('vue-ssr')
          .use(require('vue-server-renderer/client-plugin'))
      }
    }
  })

  let clientWebpackConfig
  let routes
  api.hook('beforeRun', async () => {
    clientWebpackConfig = api.resolveWebpackConfig({ type: 'client' })
    const res = await writeFiles(api, {
      watch: api.mode === 'development',
      cacheDir,
      entry: clientWebpackConfig.resolve.alias['#original-entry$']
    })
    routes = res.routes
  })

  api.registerCommand('generate', 'Build app as static website', async () => {
    const serverWebpackConfig = api.resolveWebpackConfig({ type: 'server' })
    const serverCompiler = api.createWebpackCompiler(serverWebpackConfig)
    const clientCompiler = api.createWebpackCompiler(clientWebpackConfig)
    await fs.remove(api.resolve(api.config.outDir))
    const stats = await Promise.all([
      runCompiler(serverCompiler),
      runCompiler(clientCompiler)
    ])
    reportStatus(stats)
    const staticRoutes = new Set([
      ...flattenRoutes(routes),
      ...userStaticRoutes
    ])
    await require('./generate-html')({
      staticRoutes: [...staticRoutes],
      api
    })
  })
}

exports.commandModes = {
  generate: 'production'
}

async function writeFiles(api, opts) {
  await fs.remove(opts.cacheDir)
  await fs.ensureDir(opts.cacheDir)
  const [routes] = await Promise.all([
    writeRoutes(api, opts),
    writeEntry(api, opts)
  ])
  return {
    routes
  }
}

async function writeRoutes(api, { watch, cacheDir }) {
  const outPath = path.join(cacheDir, 'routes.js')
  const routes = await collectRoutes({
    pagesDir: api.resolve('pages'),
    basePath: '/',
    componentPrefix: '#pages'
  })
  const content = 'export default ' + renderRoutes(routes)
  api.logger.debug('[vue-static] Writing routes:', outPath)
  await fs.writeFile(outPath, content, 'utf8')

  if (watch) {
    const handler = () => {
      writeRoutes(api, { watch: false, cacheDir })
    }
    require('chokidar')
      .watch('**/*.{vue,js}', {
        cwd: api.resolve('pages'),
        ignoreInitial: true
      })
      .on('add', handler)
      .on('unlink', handler)
  }

  return routes
}

async function writeEntry(api, { watch, cacheDir, entry }) {
  const outPath = path.join(cacheDir, 'entry.js')
  const exists = await fs.pathExists(entry)
  const content = exists
    ? `import entry from '#original-entry'; export default entry;`
    : `export default function () {}`
  api.logger.debug('[vue-static] Writing entry mirror:', outPath)
  await fs.writeFile(outPath, content, 'utf8')

  if (watch) {
    const handler = () => {
      writeEntry(api, { watch: false, cacheDir, entry })
    }
    require('chokidar')
      .watch(entry, {
        ignoreInitial: true
      })
      .on('add', handler)
      .on('unlink', handler)
  }
}

function runCompiler(compiler) {
  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) return reject(err)
      resolve(stats)
    })
  })
}

function flattenRoutes(routes, parentPath) {
  const res = new Set()
  for (const route of routes) {
    const currentPath = parentPath
      ? path.resolve(parentPath, route.path)
      : route.path
    if (isDynamicRoute(currentPath)) {
      continue
    }
    res.add(currentPath)
    if (route.children) {
      for (const item of flattenRoutes(route.children, currentPath)) {
        res.add(item)
      }
    }
  }
  return res
}

function isDynamicRoute(route) {
  return /:.+/.test(route)
}

function reportStatus(multiStats) {
  const result = new Set()
  for (const stats of multiStats) {
    if (stats.hasErrors()) {
      const { errors } = formatWebpackMessages(stats.toJson())
      errors.forEach(e => result.add(e))
    }
  }
  if (result.size > 0) {
    for (const error of result) {
      console.error(error)
    }
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1)
  }
}
