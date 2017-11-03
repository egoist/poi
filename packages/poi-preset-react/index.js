module.exports = () => {
  return poi => {
    poi.extendWebpack(config => {
      // Add react plugins to babel config
      config.module.rule('js')
        .use('babel-loader')
        .tap(options => {
          // When `babelrc` is not false, directly return user's babel options
          if (options.babelrc !== false) return options

          return {
            presets: [
              [options.presets[0][0], { jsx: 'react' }]
            ],
            plugins: [
              require.resolve('babel-plugin-react-require'),
              require.resolve('react-hot-loader/babel')
            ]
          }
        })

      // Add entry
      if (config.entryPoints.has('client')) {
        config.entry('client').prepend(require.resolve('react-hot-loader/patch'))
      } else {
        throw new Error('Currently only `client` entry is supported')
      }
    })
  }
}
