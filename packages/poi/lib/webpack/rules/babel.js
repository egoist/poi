module.exports = (config, { baseDir, transpileModules }) => {
  config.module
    .rule('js')
    // .js files has flow support by default
    // .ts files has typescript support via babel too
    .test(/\.(js|mjs|jsx|ts|tsx)$/)
    .include.add(filepath => {
      if (Array.isArray(transpileModules)) {
        const shouldTranspile = transpileModules.some(condition => {
          condition =
            typeof condition === 'string' ? new RegExp(condition) : condition
          return filepath.match(condition)
        })
        if (shouldTranspile) {
          return true
        }
      }
      // Don't include node_modules
      return !/node_modules/.test(filepath)
    })
    .end()
    .use('babel-loader')
    .loader(require.resolve('../loaders/babel-loader'))
    .options({
      root: baseDir,
      cacheDirectory: true,
      cacheIdentifier: composeCacheIdentifiers(
        require('babel-loader/package').version,
        require('@babel/core/package').version,
        process.env.POI_JSX,
        process.env.POI_JSX_INFER,
        process.env.POI_COMMAND
      )
    })
}

function composeCacheIdentifiers(...items) {
  return items.join('::')
}
