const path = require('path')
const dotenv = require('dotenv')

module.exports = nodeEnv => {
  const res = dotenv.config({ path: path.resolve(`.env.${nodeEnv}`) })
  const resLocal = dotenv.config({ path: path.resolve(`.env.${nodeEnv}.local`) })

  return Object.assign({}, res.parsed, resLocal.parsed)
}
