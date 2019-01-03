module.exports = function() {
  const { watch } = this.query || {}
  const outFile = this.resourcePath.replace(/\.(re|ml)$/, '.bs.js')
  const fs = this.fs || require('fs')
  try {
    fs.statSync(outFile)
    return `export * from ${JSON.stringify(outFile)}`
  } catch (_) {
    throw new Error(
      `Cannot find ${outFile}\nYou must run \`bsb -make-world${
        watch ? ' -w' : ''
      }\` first.`
    )
  }
}
