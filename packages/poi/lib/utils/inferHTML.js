const fs = require('fs')
const path = require('path')
const { ownDir } = require('./dir')
const readProjectPkg = require('./readProjectPkg')
const logger = require('@poi/logger')

function inferHTML(options = {}) {
  const pkg = readProjectPkg()
  const result = {
    pkg,
    title: pkg.productName || pkg.name || 'Poi App',
    description: pkg.description,
    template: ownDir('lib/index.ejs')
  }

  const templatePath = path.resolve(options.cwd || process.cwd(), 'index.ejs')
  if (fs.existsSync(templatePath)) {
    logger.debug(`HTML template file`, templatePath)
    result.template = templatePath
  }

  return result
}

module.exports = inferHTML
