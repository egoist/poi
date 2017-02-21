// this will copy ./static/** to ./dist-example/**

module.exports = {
  entry: 'example/index.js',
  dist: 'dist-example',
  html: {
    title: '<%= name %>'
  }
}
