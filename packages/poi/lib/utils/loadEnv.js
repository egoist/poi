const path = require('path')
const dotenv = require('dotenv')

module.exports = nodeEnv => {
  const res = dotenv.config({ path: path.resolve(`.env.${nodeEnv}`) })
  return res.parsed || {}
}
