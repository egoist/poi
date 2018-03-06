module.exports = {
  entry: ['example-vue/index.js', 'example-vue/addons.js'],

  plugins: [require('..')()],

  babel: {
    jsx: 'vue'
  }
}
