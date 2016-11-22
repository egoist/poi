module.exports = {
  presets: [
    [
      require.resolve('babel-preset-es2015'),
      {modules: false}
    ],
    require.resolve('babel-preset-stage-2')
  ],
  plugins: [
    require.resolve('babel-plugin-transform-runtime'),
    require.resolve('babel-plugin-transform-vue-jsx')
  ]
}
