const path = require('path')

module.exports = (options, req) => ({
  entry: 'src/index.js',
  dist: '<% if (electron) { %>app/dist<% } else { %>dist<% } %>',
  html: {
    title: '<%= name %>'
  },
  postcss: [
    req('autoprefixer')({
      browsers: ['ie > 8', 'last 4 versions']
    })
  ],
  webpack(cfg) {
    cfg.resolve.modules.push(path.resolve('src'))
    <% if (electron) { %>
    if (!options.dev) {
      cfg.output.publicPath = './'
    }
    cfg.target = 'electron-renderer'
    <% } %>
    return cfg
  }
})
