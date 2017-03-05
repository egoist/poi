import { Component } from 'react'
import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from '@/components/App'

render(
  <AppContainer>
    <App/>
  </AppContainer>,
  document.getElementById('app')
)

// Hot Module Replacement API
if (module.hot) {
  module.hot.accept('@/components/App', () => {
    const NextApp = require('@/components/App').default
    render(
      <AppContainer>
        <NextApp/>
      </AppContainer>,
      document.getElementById('app')
    )
  })
}
