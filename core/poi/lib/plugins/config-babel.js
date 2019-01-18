const path = require('path')

const logger = require('@poi/logger')

exports.name = 'builtin:config-babel'

exports.apply = api => {
  api.hook('createCLI', ({ command }) => {
    command
      .option('--jsx <syntax>', 'Set JSX syntax', {
        default: 'react'
      })
      .option(
        '--named-imports <loaderMap>',
        'Conver specific named imports to use custom loaders'
      )
  })

  api.hook('createWebpackChain', config => {
    const { transpileModules, jsx, namedImports } = api.config.babel || {}

    process.env.POI_JSX = jsx
    if (namedImports) {
      process.env.POI_NAMED_IMPORTS =
        typeof namedImports === 'string'
          ? namedImports
          : JSON.stringify(namedImports)
    }

    const rule = config.module.rule('js')

    rule.test([/\.js$/, /\.jsx$/, /\.ts$/, /\.tsx$/]).include.add(filepath => {
      // Transpile everthing outside node_modules
      if (!/node_modules/.test(filepath)) {
        return true
      }
      if (transpileModules) {
        const shouldTranspile = [].concat(transpileModules).some(condition => {
          return typeof condition === 'string'
            ? filepath.includes(
                `${path.sep}node_modules${path.sep}${condition}${path.sep}`
              )
            : filepath.match(condition)
        })
        if (shouldTranspile) {
          logger.debug(`Babel is transpiling addtional file "${filepath}"`)
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
        cacheIdentifier: `jsx:${process.env.POI_JSX}::namedImports:${
          process.env.POI_NAMED_IMPORTS
        }`
      })
  })
}
