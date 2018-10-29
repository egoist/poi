const util = require('util')
const fs = require('fs')
const path = require('path')
const req = require('require-from-string')

const writeFile = util.promisify(fs.writeFile)

module.exports = async function(source, map) {
  const callback = this.async()
  const { cacheDir } = this.query
  if (!cacheDir) {
    return callback(new Error('Require cache dir!'))
  }
  const filename = this.resourcePath
  const hash = path
    .relative(process.cwd(), filename)
    .replace(/[^a-z0-9_\-[\]]/gi, '-')
  const basename = path.basename(filename, '.vue') // Current this only support .vue file
  const getCacheName = name => {
    if (!/\[(.+)\]/.test(name)) {
      return '[default]'
    }

    return name.replace(/\[(.+)\]/g, `'+params['$1']+'`)
  }

  const defaultPathFile = path.join(cacheDir, hash + '__[default].json')

  let moduleFn = req(source)
  moduleFn = moduleFn.default || moduleFn
  const data = await moduleFn()
  const pagesData = data.$pages || {}
  delete data.$pages
  await Promise.all([
    writeFile(defaultPathFile, JSON.stringify(data), 'utf8'),
    ...Object.keys(pagesData).map(staticPath => {
      const pageData = Object.assign({}, data, pagesData[staticPath])
      const outFile = path.join(cacheDir, hash + `__${staticPath}.json`)
      return writeFile(outFile, JSON.stringify(pageData), 'utf8')
    })
  ])

  callback(
    null,
    `
  export default function (Component) {
    Component.options.__pageData = function (params) {
      return require('${path.join(
        cacheDir,
        hash + '__' + getCacheName(basename) + '.json'
      )}')
    }
    var oldData = Component.options.data || (function () {})
    Component.options.data = function () {
      return Object.assign({}, this.$options.__pageData(this.$route.params), oldData.call(this))
    }
  }
  `,
    map
  )
}
