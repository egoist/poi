const path = require('path')
const dotenv = require('dotenv')

module.exports = nodeEnv => {
  const res = dotenv.config({ path: path.resolve(`.env.${nodeEnv}`) })
  const resLocal = dotenv.config({ path: path.resolve(`.env.${nodeEnv}.local`) })
  const envVars = res.parsed || {};
  const localVars = resLocal.parsed || {};

  return {
      ...envVars,
      ...localVars
  }
}
