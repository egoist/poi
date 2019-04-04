exports.name = 'builtin:config-jsx-import'

exports.apply = api => {
  api.hook('createWebpackChain', config => {
    const { jsx } = api.config.babel
    if (jsx === 'preact') {
      // Automatically add `import { h, Fragment } from 'preact'` for free `h` and `Fragment` identifiers
      // In the module scope
      config.plugin('jsx-import').use(require('webpack').ProvidePlugin, [
        {
          h: ['preact', 'h'],
          Fragment: ['preact', 'Fragment']
        }
      ])
    } else if (jsx === 'react') {
      // Automatically add `import React from 'preact'` for free `React` identifier
      // In the module scope
      config.plugin('jsx-import').use(require('webpack').ProvidePlugin, [
        {
          React: 'react'
        }
      ])
    }
  })
}
