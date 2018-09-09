const path = require('path')
const JoyCon = require('joycon').default

module.exports = new JoyCon({
  // Only read up to current working directory
  stopDir: path.dirname(process.cwd())
})
