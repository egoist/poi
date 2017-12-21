const NodentCompiler = require('nodent-compiler')

module.exports = function (code, sourceMap) {
  const compiler = new NodentCompiler()
  const cb = this.async()
  try {
    const compiled = compiler.compile(
      code,
      this.resourcePath,
      sourceMap,
      {
        sourcemap: false,
        promises: true,
        noRuntime: true
      }
    )
    cb(null, compiled.code, compiled.sourceMap)
  } catch (err) {
    cb(err)
  }
}
