const path = require('path')
const globby = require('globby')

module.exports = (options = {}) => {
  return poi => {
    if (!poi.cli.isCurrentCommand('test')) return

    const getOption = (name, defaultValue) =>
      poi.options[name] || options[name] || defaultValue

    const baseDir = getOption('baseDir', poi.options.cwd)
    const outputDir = getOption('outputDir', baseDir)
    const input = process.argv.slice(3)

    const testFiles =
      input.length > 0 ? input : getOption('testFiles', '**/*.{test,spec}.js')
    const ignoreFiles = getOption('ignoreFiles', [
      '!**/node_modules/**',
      '!**/vendor/**'
    ])

    // Exclude node modules in bundled files
    poi.options.excludeNodeModules = true

    poi.extendWebpack(config => {
      const outputPath = path.resolve(poi.options.cwd, outputDir)

      config.merge({
        output: {
          path: outputPath,
          filename: '[name].transformed.js'
        },
        target: 'node'
      })
    })

    poi.cli.handleCommand('test', 'Transform test files with Poi', () => {
      const webpackConfig = poi.createWebpackConfig()

      return globby([].concat(testFiles).concat(ignoreFiles), { cwd: baseDir })
        .then(files => {
          delete webpackConfig.entry.main
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
        .then(stats => {
          if (stats.hasErrors()) {
            console.log(stats.toString('errors-only'))
          }
        })
    })
  }
}
