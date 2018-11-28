const fs = require('fs')
const logger = require('@poi/logger')

module.exports = (mode, dotenvPath) => {
  const dotenvFiles = [
    `${dotenvPath}.${mode}.local`,
    `${dotenvPath}.${mode}`,
    // Don't include `.env.local` for `test` mode
    // since normally you expect tests to produce the same
    // results for everyone
    mode !== 'test' && `${dotenvPath}.local`,
    dotenvPath
  ].filter(Boolean)

  dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
      logger.debug('Using env file:', dotenvFile)
      require('dotenv-expand')(
        require('dotenv').config({
          path: dotenvFile
        })
      )
    }
  })
}
