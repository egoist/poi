const path = require('path')
const fs = require('fs-extra')

exports.name = 'vue-static'

exports.cli = (api, { staticRoutes, resourceHints = true } = {}) => {
  const { command } = api

  // Override the action for default command
  const defaultAction = command.commandAction
  command.action(async (...args) => {
    if (api.cli.options.serve) {
      // Use default action under --serve
      // It will be served as a normal SPA
      await defaultAction(...args)
    } else {
      // Generate two builds otherwise
      // And use them to generate static HTML files with vue-server-renderer
      const clientConfig = api.createWebpackChain({ type: 'client' }).toConfig()
      const serverConfig = api.createWebpackChain({ type: 'server' }).toConfig()
      const [clientStats, serverStats] = await Promise.all([
        api.runCompiler(api.createWebpackCompiler(clientConfig)),
        api.runCompiler(api.createWebpackCompiler(serverConfig))
      ])
      if (clientStats.hasErrors() || serverStats.hasErrors()) {
        return
      }
      await fs.copy(api.resolveCwd(`.vue-static/client`), api.resolveOutDir())
      await require('./generate')(api, {
        serverBundle: require(api.resolveCwd(
          '.vue-static/server/vue-ssr-server-bundle.json'
        )),
        clientManifest: require(api.resolveCwd(
          '.vue-static/client/vue-ssr-client-manifest.json'
        )),
        staticRoutes,
        resourceHints,
        htmlSkeletion: await fs.readFile(
          api.resolveCwd('.vue-static/client/index.html'),
          'utf8'
        )
      })
      await Promise.all([
        fs.remove(api.resolveCwd('.vue-static')),
        fs.remove(api.resolveOutDir('vue-ssr-client-manifest.json'))
      ])
      api.logger.done(
        `Successfully generated into ${path.relative(
          process.cwd(),
          api.resolveOutDir()
        )}`
      )
    }
  })
}

exports.apply = api => {
  if (
    !api.hasDependency('vue') ||
    !api.hasDependency('vue-template-compiler')
  ) {
    throw new api.PoiError({
      message: `You must have both "vue" and "vue-template-compiler" installed in your project`
    })
  }

  api.hook('createConfig', config => {
    if (!Array.isArray(config.entry) && typeof config.entry === 'object') {
      throw new api.PoiError({
        message: `When using plugin vue-static, the value of \`entry\` option cannot be an object`
      })
    }

    if (Array.isArray(config.entry) && config.entry.length > 1) {
      api.logger.warn(
        `\`entry\` is an array, however we only use the first item in vue-static plugin`
      )
    }

    config.babel.jsx = 'vue'
  })

  api.hook('createWebpackChain', (config, { type }) => {
    // Remove the entry added by Poi core
    config.entryPoints.clear()
    // And instead add our own entries
    config.entry('index').add(path.join(__dirname, `app/entry-${type}.js`))
    if (api.config.devServer.hot && api.cli.options.serve) {
      config.entry('index').prepend('#webpack-hot-client')
    }
    // Set the user entry as an alias so that we can reference it in app code
    config.resolve.alias.set(
      '#user-entry$',
      api.resolveCwd(
        Array.isArray(api.config.entry) ? api.config.entry[0] : api.config.entry
      )
    )
    // Output files to a temp directory
    config.output.path(api.resolveCwd(`.vue-static/${type}`))

    // Add vue ssr plugin
    config.plugin('vue-ssr').use(require(`vue-server-renderer/${type}-plugin`))

    config.module.rule('js').include.add(path.join(__dirname, 'app'))

    if (type === 'server') {
      config.output.libraryTarget('commonjs2')
      config.target('node')
      const externals = config.get('externals')
      config.externals(
        [
          require('webpack-node-externals')({
            whitelist: [/\.(?!(?:jsx?|json)$).{1,5}$/i]
          })
        ].concat(externals || [])
      )
      config.optimization.splitChunks(false)
      config.optimization.runtimeChunk(false)
    }

    if (!api.cli.options.serve) {
      config
        .plugin('html')
        .tap(([options]) => [
          Object.assign(options, { inject: false, minify: false })
        ])
    }

    config.plugin('constants').tap(([options]) => [
      Object.assign({}, options, {
        'process.server': type === 'server',
        'process.browser': type === 'client',
        'process.client': type === 'client'
      })
    ])

    config.plugin('print-status').tap(([options]) => [
      Object.assign(options, {
        printFileStats: false
      })
    ])
  })
}
