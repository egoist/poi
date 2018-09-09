module.exports = {
  eslint: {
    extends: ['eslint:recommended', 'plugin:react/recommended'],
    env: {
      node: true,
      browser: true
    }
  },
  deps: {
    'eslint-plugin-react': '^7.11.1'
  }
}
