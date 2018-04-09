const path = require('path')
const dotenv = require('dotenv')

module.exports = nodeEnv => {
  try {
    return dotenv.config({ path: path.resolve(`.env.${nodeEnv}`) })
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {}
    }
    throw err
  }
}
