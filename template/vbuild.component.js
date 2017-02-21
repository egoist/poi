module.exports = {
  entry: 'src/<%= moduleName %>.vue',
  // then user can access `window.<%= moduleName %>` in browser as well
  moduleName: '<%= moduleName %>',
  html: false,
  minimize: false,
  sourceMap: false,
  filename: {
    js: '<%= name %>.js',
    css: '<%= name %>.css'
  },
  // this will not copy ./static/** to ./dist/**
  copy: false
}
