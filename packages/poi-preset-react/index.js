module.exports = () => {
  return poi => {
    poi.extendWebpack(config => {
      // Add react plugins to babel config
      const jsRule = config.rules.get('js')

      jsRule.loaders.update('babel-loader', options => {
        // When `babelrc` is not false, directly return user's babel options
        if (options.babelrc !== false) return options

        return {
          presets: [
            [options.presets[0][0], { jsx: 'react' }]
          ],
          plugins: [
            require.resolve('react-hot-loader/babel')
          ]
        }
      })

      // Add entry
      if (config.get('entry.client')) {
        config.prepend('entry.client', require.resolve('react-hot-loader/patch'))
      } else {
        throw new Error('Currently only `client` entry is supported')
      }
    })
  }
}
