import React from 'react'
import ReactDOM from 'react-dom'
import SassModulesInclusion from './SassModulesInclusion'

describe('sass modules inclusion', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    ReactDOM.render(<SassModulesInclusion />, div)
  })
})
