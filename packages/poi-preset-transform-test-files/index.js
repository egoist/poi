const path = require('path')
const globby = require('globby')
const webpack = require('webpack')

module.exports = () => {
  return poi => {
    poi.run('test', config => {
      const input = poi.argv._.slice(1)
      const inputFiles = input > 0 ? input : ['**/*.test.js']
      const ignores = ['!**/node_modules/**', '!**/vendor/**']

      const outputDir = path.resolve(poi.options.cwd, 'output_test')

      config.output.path(outputDir)

      // Exclude node_modules in bundle file
      poi.webpackUtils.externalize(config)

      return globby(inputFiles.concat(ignores), { cwd: poi.options.cwd })
        .then(files => {
          config.entryPoints.delete('client')
          config.entry('test').merge(files.map(file => path.resolve(poi.options.cwd, file)))
        }).then(() => poi.runWebpack(webpack(config.toConfig())))
    })
  }
}
