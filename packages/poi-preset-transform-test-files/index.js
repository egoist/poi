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
      const baseDir = poi.argv.baseDir || './test'
      const input = poi.argv._.slice(1)
      const inputFiles = input.length > 0 ? input : ['**/*.{test,spec}.js']
      const ignores = ['!**/node_modules/**', '!**/vendor/**']

      return globby(inputFiles.concat(ignores), { cwd: baseDir })
        .then(files => {
          delete webpackConfig.entry.client
          webpackConfig.entry = files.reduce((res, filename) => {
            res[filename.replace(/\.[a-z]{2,}$/, '')] = path.resolve(baseDir, filename)
            return res
          }, {})
          console.log(webpackConfig.entry)
        })
        .then(() => poi.runWebpack(webpack(webpackConfig)))
    })
  }
}
