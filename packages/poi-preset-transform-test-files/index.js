const path = require('path')
const globby = require('globby')
const webpack = require('webpack')

module.exports = () => {
  return poi => {
    poi.extendWebpack('test', config => {
      const outputDir = path.resolve(poi.options.cwd, 'output_test')

      config.output.path(outputDir)

      // Exclude node_modules in bundle file
      poi.webpackUtils.externalize(config)
    })

    poi.run('test', webpackConfig => {
      const input = poi.argv._.slice(1)
      const inputFiles = input.length > 0 ? input : ['**/*.test.js']
      const ignores = ['!**/node_modules/**', '!**/vendor/**']

      return globby(inputFiles.concat(ignores), { cwd: poi.options.cwd })
        .then(files => {
          delete webpackConfig.entry.client
          webpackConfig.entry.test = files
            .map(file => path.resolve(poi.options.cwd, file))
        })
        .then(() => poi.runWebpack(webpack(webpackConfig)))
    })
  }
}
