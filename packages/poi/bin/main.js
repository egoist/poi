const cac = require('cac')
const loudRejection = require('loud-rejection')
const update = require('update-notifier')
const pkg = require('../package.json')

loudRejection()

update({ pkg }).notify()

function getOpts(input, flags, mode) {
  const opts = Object.keys(flags).reduce((res, next) => {
    if (typeof flags[next] !== 'undefined') {
      res[next] = flags[next]
    }
    return res
  }, {})

  if (input.length > 0) {
    opts.entry = input
  }
  return Object.assign({ mode }, opts)
}

function createHandler(mode) {
  return (input, flags) => {
    const run = require('./run')
    run(getOpts(input, flags, mode)).catch(run.handleError)
  }
}

const cli = cac()

cli.option('dist', {
  alias: 'd',
  desc: 'Output directory'
})
.option('config', {
  alias: 'c',
  desc: 'Use custom path to config file'
})
.option('templateCompiler', {
  desc: 'Use full build of Vue'
})
.option('jsx', {
  desc: 'Specify JSX transformer, like "vue", "react" or any JSX pragma'
})
.option('rawErrors', {
  desc: 'Output original webpack errors'
})
.option('no-clear', {
  desc: 'Do not clear screen'
})
.option('inspectOptions', {
  desc: 'Output final options'
})
.option('require', {
  desc: 'Require modules like `ts-node/register` before running Poi'
})

cli
  .command('build', 'Build app in production mode', createHandler('production'))
  .option('generate-stats', {
    desc: 'Generate webpack stats for the bundle file'
  })
  .option('no-progress', {
    desc: 'Disable progress bar'
  })
  .option('library', {
    desc: 'Build as a library'
  })

cli
  .command('*', {
    desc: 'Run app in development mode',
    alias: 'dev'
  }, createHandler('development'))
  .option('port', {
    desc: 'Custom dev server port'
  })
  .option('proxy', {
    desc: 'Proxy API request',
    type: 'string'
  })
  .option('open', {
    alias: 'o',
    desc: 'Open App after compiling'
  })
  .option('restartOnFileChanges', {
    alias: 'rs',
    desc: 'Restart Poi on file changes'
  })

cli
  .command('watch', 'Run app in watch mode', createHandler('watch'))
  .option('restart-on-file-changes', {
    alias: 'rs',
    desc: 'Restart Poi on file changes'
  })

cli.command('test', 'Run app in test mode', createHandler('test'))

cli.parse()
