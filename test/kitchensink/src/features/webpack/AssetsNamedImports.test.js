import React from 'react'
import ReactDOM from 'react-dom'
import { ReactComponent as Logo } from './assets/logo.svg'
import { ReactComponent as Text } from './assets/text.md'

describe('assets named imports', () => {
  it('ReactComponent from svg', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Logo />, div)
  })

  it('ReactComponent from md', () => {
    const div = document.createElement('div')
    ReactDOM.render(<Text />, div)
    console.log(div.outerHTML)
  })
})
