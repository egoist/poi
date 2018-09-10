module.exports = () => [
  {
    name: 'framework',
    type: 'list',
    message: 'Choose a framework to use',
    choices: [{ name: 'React', value: 'react' }, { name: 'Vue', value: 'vue' }]
  },
  {
    name: 'features',
    type: 'checkbox',
    message: 'Check the features needed for your project',
    choices({ framework }) {
      return [
        { name: 'Linter', value: 'linter' },
        { name: 'PWA (Progressive Web APP) support', value: 'pwa' },
        { name: 'Router (TODO)', value: 'router' },
        framework === 'vue' && { name: 'Vuex (TODO)', value: 'vuex' }
      ].filter(Boolean)
    }
  }
]
