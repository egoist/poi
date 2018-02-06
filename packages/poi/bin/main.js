const cac = require('cac')
const Poi = require('../lib')
const isPath = require('../lib/utils/isPath')

const { input, flags } = cac.parse(process.argv.slice(2))

let command
let entry
if (!input[0] || isPath(input[0])) {
  command = 'develop'
  entry = input
} else {
  command = input[0]
  entry = input.slice(1)
}

const options = {
  ...flags,
  entry
}

if (entry.length === 0) {
  delete options.entry
}

const app = new Poi(command, options)

app.run().catch(err => {
  console.error(err)
  process.exit(1)
})
