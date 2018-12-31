const chokidar = require('chokidar')
const bsb = require('bsb-js')

exports.name = 'reason'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    if (config.module.rules.has('bs')) {
      config.module.rules.delete('bs')
    }

    // ReasonML / BuckleScript support
    config.module
      .rule('bs')
      .test(/\.(re|ml)$/)
      .use('bs-loader')
      .loader(require.resolve('@poi/bs-loader'))

    config.plugin('watch-reason-files').use(WatchReasonFiles, [api.spinner])
  })
}

const ID = 'watch-reason-files'

class WatchReasonFiles {
  constructor(spinner) {
    this.spinner = spinner
  }

  apply(compiler) {
    let watching
    let isFirstBuild = true

    compiler.hooks.beforeCompile.tapPromise(ID, async () => {
      if (!isFirstBuild) return

      isFirstBuild = false

      if (compiler.watchMode) {
        const rebuild = () =>
          bsb.runBuild().catch(error => {
            console.error(error)
            process.exitCode = 1
          })

        watching = chokidar.watch(['**/*.{re,ml}'], {
          ignoreInitial: true,
          ignored: ['**/node_modules/**', compiler.options.output.path]
        })

        watching.on('add', rebuild)
        watching.on('change', rebuild)
        watching.on('unlink', rebuild)
      }

      await bsb.runBuild()
    })

    compiler.hooks.watchClose.tap(ID, () => {
      watching && watching.close()
    })
  }
}
