import { configure } from '@storybook/vue'

function loadStories() {
  require('./stories')
}

configure(loadStories, module)
