#!/usr/bin/env node
const cac = require('cac').default
const pkg = require('../package')

const { input, flags } = cac.parse(process.argv.slice(2))

if (flags.version || flags.v) {
  console.log(pkg.version)
  process.exit()
}

// Only for development purpose
// `require-so-slow` is installed in root directory
if (flags.debugTrace) {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const requireSlow = require('require-so-slow')
  process.on('exit', () => {
    console.log('Writing require-trace.trace')
    requireSlow.write('require-trace.trace')
  })
}

const {
  config: configFile,
  baseDir,
  inspectWebpack,
  progress,
  debug,
  cleanOutDir
} = flags
delete flags.config
delete flags.baseDir
delete flags.inspectWebpack
delete flags.progress
delete flags.debug
delete flags.help
delete flags.debugTrace
delete flags.cleanOutDir

const command = input.shift()
// Poi config, that can override data in your config file
// Assigned to poi
const config = Object.assign(
  { entry: input.length > 0 ? input : undefined },
  flags
)

const cliOptions = {
  inspectWebpack,
  progress,
  debug
}

// App options, assigned to poi.options
const options = {
  configFile,
  baseDir,
  command,
  cliOptions,
  cleanOutDir
}

const poi = require('../lib')

const app = poi(options, config)
app.run().catch(err => {
  console.error(err.stack)
  process.exit(1)
})
