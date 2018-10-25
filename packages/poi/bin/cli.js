#!/usr/bin/env node
const cac = require('cac').default
const pkg = require('../package')

const { input, flags } = cac.parse(process.argv.slice(2))

if (flags.version || flags.v) {
  console.log(pkg.version)
  process.exit()
}

const {
  config: configFile,
  baseDir,
  inspectWebpack,
  progress,
  debug,
  debugTrace,
  cleanOutDir,
  jsx,
  ...configData
} = flags

delete flags.help
delete flags.version

// Only for development purpose
// `require-so-slow` is installed in root directory
if (debugTrace) {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const requireSlow = require('require-so-slow')
  process.on('exit', () => {
    console.log('Writing require-trace.trace')
    requireSlow.write('require-trace.trace')
  })
}

if (jsx) {
  process.env.POI_JSX = jsx
}

const command = input.shift()
// Poi config, that can override data in your config file
// Assigned to poi
const config = Object.assign(
  { entry: input.length > 0 ? input : undefined },
  configData
)

// App options, assigned to poi.options
const options = {
  configFile,
  baseDir,
  command,
  cleanOutDir,
  inspectWebpack,
  progress,
  debug
}

const poi = require('../lib')

const app = poi(options, config)
app.run().catch(err => {
  console.error(err.stack)
  process.exit(1)
})
