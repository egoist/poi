import React from 'react'
import ReactDOM from 'react-dom'
import CssModulesInclusion from './CssModulesInclusion'

describe('css modules inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<CssModulesInclusion />, div)
  })
})
