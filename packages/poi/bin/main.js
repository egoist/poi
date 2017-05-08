const chalk = require('chalk')
const yargs = require('yargs')
const update = require('update-notifier')
const pkg = require('../package.json')

update({ pkg }).notify()

function getOpts(argv, mode) {
  const opts = Object.keys(argv).reduce((curr, next) => {
    if (typeof argv[next] !== 'undefined' && next !== 'mode') {
      curr[next] = argv[next]
    }
    return curr
  }, {})
  const cmd = argv._[0]
  let entry
  if (['build', 'dev', 'watch', 'test'].indexOf(cmd) > -1) {
    entry = argv._.slice(1)
  } else {
    entry = argv._
  }
  if (entry.length > 0) {
    opts.entry = entry
  }
  return Object.assign({ mode }, opts)
}

function createHandler(mode) {
  return argv => {
    const run = require('./run')
    run(getOpts(argv, mode)).catch(run.handleError)
  }
}

const sharedOptions = {
  dist: {
    alias: 'd',
    desc: 'Output directory'
  },
  config: {
    alias: 'c',
    desc: 'Use custom path to config file'
  },
  templateCompiler: {
    desc: 'Use full build of Vue'
  },
  'no-clear': {
    desc: 'Do not clear screen'
  }
}

yargs // eslint-disable-line no-unused-expressions
  .usage(`\n${chalk.yellow('poi')} [command] [options]`)
  .command(['build'], 'Build App in Production mode', cli => {
    cli.options(Object.assign({}, sharedOptions, {
      generateStats: {
        desc: 'Generate webpack stats for the bundle file'
      }
    }))
  }, createHandler('production'))
  .command(['*', 'dev'], 'Run App in development mode', cli => {
    cli.options(Object.assign({}, sharedOptions, {
      port: {
        desc: 'Custom dev server port',
        type: 'number'
      },
      host: {
        desc: 'Custom dev server hostname',
        type: 'string'
      },
      proxy: {
        desc: 'Proxy API request',
        type: 'string'
      },
      open: {
        alias: 'o',
        desc: 'Open App after compiling'
      }
    }))
  }, createHandler('development'))
  .command('watch', 'Run App in watch mode', () => {}, createHandler('watch'))
  .command('test', 'Compile test files', () => {}, createHandler('test'))
  .version(pkg.version)
  .alias('version', 'v')
  .alias('help', 'h')
  .epilogue('for more information, find our manual at https://poi.js.org')
  .help()
  .argv
