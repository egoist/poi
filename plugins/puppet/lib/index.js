const os = require('os')
const path = require('path')
const glob = require('fast-glob')

const FRAMEWORKS = ['mocha', 'tape']

exports.name = 'puppet'

exports.cli = api => {
  api.cli
    .command('puppet [...files]', 'Run tests with Puppeteer')
    .option('--no-headless', `Don't run in headless mode`)
    .option('--watch', 'Watch files and re-run tests')
    .option(
      '--framework <framework>',
      `Use a testing framework (${FRAMEWORKS.join(' | ')})`
    )
    .option('--ui <ui>', 'Set user-interface for mocha', {
      default: 'bdd'
    })
    .action(async (patterns, options) => {
      if (api.mode !== 'test') {
        throw new api.PoiError({
          message: `You must run Poi in test mode`
        })
      }

      if (options.framework && !FRAMEWORKS.includes(options.framework)) {
        throw new api.PoiError({
          message: `Invalid test framework, currently only support: ${FRAMEWORKS.join(
            ', '
          )}`
        })
      }

      const files = await glob(
        ['!**/node_modules/**', '!**/dist/**'].concat(
          patterns.length > 0 ? patterns : '**/*.test.{js,ts}'
        )
      ).then(files => files.map(file => path.resolve(file)))

      if (files.length === 0) {
        throw new api.PoiError({
          message: 'No test files, exit.'
        })
      }

      // Output to a temp folder
      const outDir = path.join(os.tmpdir(), `poi-puppet-${Date.now()}`)

      api.hook('createWebpackChain', config => {
        config.node.set('fs', 'empty').set('child_process', 'empty')
        config.output.path(outDir)
        config.entryPoints.clear()
        config.merge({
          entry: {
            index: files
          }
        })

        config.entry('index').prepend(path.join(__dirname, 'shared/before'))

        if (options.framework === 'tape') {
          config.entry('index').prepend(path.join(__dirname, 'tape/before'))
        } else if (options.framework === 'mocha') {
          config
            .entry('index')
            .prepend(path.join(__dirname, 'mocha/before.js'))
            .add(path.join(__dirname, 'mocha/after.js'))
        }

        if (options.watch) {
          config
            .plugin('puppet-clear-console')
            .before('print-status')
            .use(
              class PuppetClearConsole {
                apply(compiler) {
                  compiler.hooks.done.tap('puppet-clear-console', () => {
                    process.stdout.write('\u001Bc')
                  })
                }
              }
            )
        }
      })

      const compiler = api.createWebpackCompiler(
        api.createWebpackChain().toConfig()
      )

      await require('./run')({
        compiler,
        outDir,
        options,
        logger: api.logger,
        runCompiler: api.runCompiler
      })
    })
}
