const fs = require('fs')
const path = require('path')
const { ownDir } = require('./dir')
const readProjectPkg = require('./readProjectPkg')
const logger = require('../logger')

function inferHTML(options) {
  const result = {
    title: 'Poi App',
    template: ownDir('lib/index.ejs')
  }

  const pkg = readProjectPkg()
  result.pkg = pkg
  result.title = pkg.productName || pkg.name
  result.description = pkg.description

  const templatePath = path.resolve(options.cwd || process.cwd(), 'index.ejs')
  if (fs.existsSync(templatePath)) {
    logger.debug(`HTML template file`, templatePath)
    result.template = templatePath
  }

  return result
}

module.exports = inferHTML
