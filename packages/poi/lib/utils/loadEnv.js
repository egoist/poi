const path = require('path')
const dotenv = require('dotenv')

module.exports = nodeEnv => {
  const environmentSpecificEnv = dotenv.config({
    path: path.resolve(`.env.${nodeEnv}`)
  })
  const localEnv =
    nodeEnv === 'test'
      ? {}
      : dotenv.config({
          path: path.resolve(`.env.local`)
        })
  const environmentSpecificLocalEnv = dotenv.config({
    path: path.resolve(`.env.${nodeEnv}.local`)
  })
  const defaultEnv = dotenv.config({ path: path.resolve('.env') })

  return Object.assign(
    {},
    defaultEnv.parsed,
    localEnv.parsed,
    environmentSpecificEnv.parsed,
    environmentSpecificLocalEnv.parsed
  )
}
