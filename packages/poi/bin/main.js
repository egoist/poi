const cac = require('cac')
const updateNotifier = require('update-notifier')
const Poi = require('../lib')
const isPath = require('../lib/utils/isPath')
const pkg = require('../package')

require('loud-rejection')()

updateNotifier({ pkg }).notify()

// To start Poi, we will need to know which `command` you're calling
// And you can also supply options via CLI flags
const { input, flags } = cac.parse(process.argv.slice(2))

// Handle `--version` before starting Poi
if (flags.version || flags.v) {
  console.log(require('../package').version)
  process.exit()
}

// Get command from CLI input
// When there's no input or the first element of input is a file path
// We think you're in the `develop` command
// Otherwise you're in the `input[0]` command
// And the rest of input becomes the webpack `entry`
let command
let entry
if (!input[0] || isPath(input[0])) {
  command = 'develop'
  entry = input
} else {
  command = input[0]
  entry = input.slice(1)
}

// Create Poi options
const options = Object.assign({}, flags, {
  entry,
  // Keep flags as flags so we know which options are from CLI
  flags
})

if (entry.length === 0) {
  delete options.entry
}

const app = new Poi(command, options)

app.run().catch(err => {
  console.error(err.stack)
  process.exit(1)
})
