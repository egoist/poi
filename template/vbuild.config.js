const path = require('path')

module.exports = (options, req) => ({
  entry: 'src/index.js',
  dist: '<% if (electron) { %>app/dist<% } else { %>dist<% } %>',
  html: {
    title: '<%= name %>'
  },
  postcss: [
    // add more postcss plugins here
    // by default we have autoprefixer pre added
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
