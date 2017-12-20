const path = require('path')
const globby = require('globby')
const webpack = require('webpack')

module.exports = (options = {}) => {
  return poi => {
    const getOption = (name, defaultValue) => poi.argv[name] || options[name] || defaultValue

    const baseDir = getOption('baseDir', poi.options.cwd)
    const outputDir = getOption('outputDir', baseDir)
    const input = poi.argv._.slice(1)
    const testFiles = input.length > 0 ? input : (options.testFiles || '**/*.{test,spec}.js')
    const ignoreFiles = getOption('ignoreFiles', ['!**/node_modules/**', '!**/vendor/**'])

    poi.extendWebpack('test', config => {
      const outputPath = path.resolve(poi.options.cwd, outputDir)

      config.output.path(outputPath)
      config.output.filename('[name].transformed.js')

      // Exclude node_modules in bundle file
      poi.webpackUtils.externalize(config)
    })

    poi.run('test', webpackConfig => {
      return globby([].concat(testFiles).concat(ignoreFiles), { cwd: baseDir })
        .then(files => {
          delete webpackConfig.entry.client
          webpackConfig.entry = files.reduce((acc, filename) => {
            return Object.assign(acc, {
              [filename.replace(/\.[^/.]+$/, '')]: path.resolve(baseDir, filename)
            })
          }, {})
        })
        .then(() => poi.runWebpack(webpack(webpackConfig)))
    })
  }
}
