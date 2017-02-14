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
  vendor: ['vue']
})
