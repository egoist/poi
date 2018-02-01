const path = require('path')
const globby = require('globby')

module.exports = (options = {}) => {
  return poi => {
    if (!poi.isCurrentCommand('test')) return

    const getOption = (name, defaultValue) =>
      poi.argv[name] || options[name] || defaultValue

    const baseDir = getOption('baseDir', poi.options.cwd)
    const outputDir = getOption('outputDir', baseDir)
    const input = poi.argv._.slice(1)
    const testFiles =
      input.length > 0 ? input : options.testFiles || '**/*.{test,spec}.js'
    const ignoreFiles = getOption('ignoreFiles', [
      '!**/node_modules/**',
      '!**/vendor/**'
    ])

    poi.extendWebpack(config => {
      const outputPath = path.resolve(poi.options.cwd, outputDir)

      config.set('output.path', outputPath)
      config.set('output.filename', '[name].transformed.js')

      // Exclude node_modules in bundle file
      poi.webpackUtils.externalize(config)
    })

    poi.cli.handleCommand('test', 'Transform test files with Poi', () => {
      const webpackConfig = poi.createWebpackConfig()

      return globby([].concat(testFiles).concat(ignoreFiles), { cwd: baseDir })
        .then(files => {
          delete webpackConfig.entry.client
          webpackConfig.entry = files.reduce((acc, filename) => {
            return Object.assign(acc, {
              [filename.replace(/\.[^/.]+$/, '')]: path.resolve(
                baseDir,
                filename
              )
            })
          }, {})
        })
        .then(() => poi.runCompiler(webpackConfig))
    })
  }
}
