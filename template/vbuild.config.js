const path = require('path')

module.exports = (options, req) => ({
  entry: 'src/index.js',
  html: {
    title: '<%= name %>'
  },
  postcss: [
    req('autoprefixer')({
      browsers: ['ie > 8', 'last 4 versions']
    })
  ],
  vendor: ['vue'],
  webpack(cfg) {
    cfg.resolve.modules.push(path.resolve('src'))
    return cfg
  }
})
