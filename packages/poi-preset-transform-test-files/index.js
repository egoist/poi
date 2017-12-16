const path = require('path')
const globby = require('globby')
const webpack = require('webpack')

module.exports = (options = {}) => {
  const { outputDir = '' } = options

  return poi => {
    poi.extendWebpack('test', config => {
      const outputPath = path.resolve(poi.options.cwd, outputDir)

      config.output.path(outputPath)
      config.output.filename('[name].transformed.js')

      // Exclude node_modules in bundle file
      poi.webpackUtils.externalize(config)
    })

    poi.run('test', webpackConfig => {
      const baseDir = poi.argv.baseDir || poi.options.cwd
      const input = poi.argv._.slice(1)
      const inputFiles = input.length > 0 ? input : ['**/*.{test,spec}.js']
      const ignores = ['!**/node_modules/**', '!**/vendor/**']

      return globby(inputFiles.concat(ignores), { cwd: baseDir })
        .then(files => {
          delete webpackConfig.entry.client
          webpackConfig.entry = files.reduce((acc, file) => {
            const filename = outputDir ? path.basename(file) : file

            return {
              ...acc,
              [filename.replace(/\.[^/.]+$/, '')]: path.resolve(baseDir, file)
            }
          }, {})
        })
        .then(() => poi.runWebpack(webpack(webpackConfig)))
    })
  }
}
