import React from 'react'
import ReactDOM from 'react-dom'
import ScssInclusion from './ScssInclusion'

describe('scss inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<ScssInclusion />, div)
  })
})
