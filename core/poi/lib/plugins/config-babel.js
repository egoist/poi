const logger = require('@poi/logger')

exports.name = 'builtin:config-babel'

exports.apply = api => {
  api.hook('createCLI', ({ command }) => {
    command.option('--jsx <syntax>', 'Set JSX syntax', {
      default: 'react'
    })
  })

  api.hook('createWebpackChain', config => {
    const { transpileModules, jsx } = api.config.babel || {}

    process.env.POI_JSX = jsx

    const rule = config.module.rule('js')

    rule.test([/\.js$/, /\.jsx$/, /\.ts$/, /\.tsx$/]).include.add(filepath => {
      // Transpile everthing outside node_modules
      if (!/node_modules/.test(filepath)) {
        return true
      }
      if (transpileModules) {
        const shouldTranspile = [].concat(transpileModules).some(name => {
          return filepath.includes(`/node_modules/${name}/`)
        })
        if (shouldTranspile) {
          logger.debug('babel', `Transpiling module file "${filepath}"`)
          return true
        }
      }
      return false
    })

    api.webpackUtils.addParallelSupport(rule)

    rule
      .use('babel-loader')
      .loader(require.resolve('../webpack/babel-loader'))
      .options({
        cacheDirectory: api.config.cache,
        cacheCompression: api.isProd,
        cacheIdentifier: `jsx:${process.env.POI_JSX}`
      })
  })
}
