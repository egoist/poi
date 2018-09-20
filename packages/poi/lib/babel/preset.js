const env = process.env.BABEL_ENV || process.env.NODE_ENV

module.exports = (context, { jsx, jsxPragmaFrag, loose } = {}) => {
  jsx = jsx || 'react'
  jsxPragmaFrag = jsxPragmaFrag || 'React.Fragment'
  loose = typeof loose === 'boolean' ? loose : false

  const presets = [
    [
      require.resolve('@babel/preset-env'),
      {
        modules: env === 'test',
        targets:
          env === 'test'
            ? {
                node: 'current'
              }
            : {
                ie: 9
              }
      }
    ]
  ]

  const plugins = []

  if (jsx === 'vue') {
    plugins.push(
      require.resolve('@babel/plugin-syntax-jsx'),
      require.resolve('babel-plugin-transform-vue-jsx')
    )
  } else if (typeof jsx === 'string') {
    presets.push([
      require.resolve('@babel/preset-react'),
      {
        pragma: jsx === 'react' ? 'React.createElement' : jsx,
        pragmaFrag: jsxPragmaFrag
      }
    ])
  }

  // stage-3 features
  plugins.push(require.resolve('@babel/plugin-syntax-dynamic-import'), [
    require.resolve('@babel/plugin-proposal-class-properties'),
    {
      loose
    }
  ])

  plugins.push([
    require('@babel/plugin-transform-runtime'),
    {
      helpers: false,
      regenerator: true
    }
  ])

  return {
    presets,
    plugins
  }
}
