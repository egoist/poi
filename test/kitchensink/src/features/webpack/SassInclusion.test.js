import React from 'react'
import ReactDOM from 'react-dom'
import SassInclusion from './SassInclusion'

describe('sass inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<SassInclusion />, div)
  })
})
