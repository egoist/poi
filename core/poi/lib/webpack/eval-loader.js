const NativeModule = require('module')

module.exports = async function(source, map) {
  this.cacheable()
  const done = this.async()

  const exec = (code, filename) => {
    delete require.cache[filename]
    const module = new NativeModule(filename, this)
    module.paths = NativeModule._nodeModulePaths(this.context)
    module.filename = filename
    module._compile(code, filename)
    return module.exports.default || module.exports
  }

  try {
    const exported = exec(source, this.resourcePath)
    const result = await exported.call(this)
    done(null, `${JSON.stringify(result)}`, map)
  } catch (error) {
    done(error)
  }
}
