const logger = require('@poi/logger')

exports.name = 'builtin:config-babel'

exports.cli = ({ command }) => {
  command
    .option('--jsx <syntax>', 'Set JSX syntax', {
      default: 'react'
    })
    .option('--no-babelrc', `Disable .babelrc files`)
    .option('--no-babel-config-file', `Disable babel.config.js`)
    .option(
      '--named-imports <loaderMap>',
      'Conver specific named imports to use custom loaders'
    )
}

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const { transpileModules, jsx, namedImports } = api.config.babel || {}

    process.env.POI_JSX = jsx
    if (namedImports) {
      process.env.POI_NAMED_IMPORTS =
        typeof namedImports === 'string'
          ? namedImports
          : JSON.stringify(namedImports)
    }

    // Handle .mjs
    config.module
      .rule('mjs')
      .test(/\.mjs$/)
      .type('javascript/auto')

    // Handle other js files
    const rule = config.module.rule('js')

    rule
      .test([/\.m?js$/, /\.jsx$/, /\.ts$/, /\.tsx$/])
      .include.add(filepath => {
        // Ensure there're no back slashes
        filepath = filepath.replace(/\\/g, '/')
        // Transpile everthing outside node_modules
        if (!/node_modules/.test(filepath)) {
          return true
        }
        if (transpileModules) {
          const shouldTranspile = []
            .concat(transpileModules)
            .some(condition => {
              return typeof condition === 'string'
                ? filepath.includes(`/node_modules/${condition}/`)
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
        }`,
        babelrc: api.config.babel.babelrc,
        configFile: api.config.babel.configFile
      })
  })
}
