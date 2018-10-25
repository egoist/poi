const path = require('path')

const env = process.env.BABEL_ENV || process.env.NODE_ENV
const isTest = env === 'test'
const transformModules = isTest

const validateBoolOption = (name, value, defaultValue) => {
  if (typeof value === 'undefined') {
    value = defaultValue
  }

  if (typeof value !== 'boolean') {
    throw new TypeError(`Poi babel preset: '${name}' option must be a boolean.`)
  }

  return value
}

module.exports = (
  context,
  { jsx, jsxPragmaFrag, flow, typescript, namedAssetImport, env } = {}
) => {
  jsxPragmaFrag = jsxPragmaFrag || 'React.Fragment'

  // POI_JSX is set by `--jsx` via Poi CLI
  // POI_JSX_DEFAULT is inferred from project's dependencies
  jsx = process.env.POI_JSX || jsx || process.env.POI_JSX_DEFAULT || 'react'
  const isVueJSX = jsx === 'vue'
  const isReactJSX = jsx === 'react'

  // Enable flow and typescript by default at the same time
  // typescript transforms will only be applied to .ts .tsx files
  const isFlowEnabled = validateBoolOption('flow', flow, true)
  const isTypeScriptEnabled = validateBoolOption('typescript', typescript, true)

  const presets = [
    [
      require('@babel/preset-env'),
      Object.assign(
        {
          modules: transformModules,
          targets: isTest
            ? {
                node: 'current'
              }
            : {
                ie: 9
              }
        },
        env
      )
    ],
    !isVueJSX && [
      require('@babel/preset-react'),
      {
        pragma: isReactJSX ? 'React.createElement' : jsx,
        pragmaFrag: jsxPragmaFrag
      }
    ],
    isTypeScriptEnabled && require('@babel/preset-typescript')
  ].filter(Boolean)

  const plugins = [
    // Strip flow types before any other transform, emulating the behavior
    // order as-if the browser supported all of the succeeding features
    isFlowEnabled && require('@babel/plugin-transform-flow-strip-types'),
    // JSX config
    isVueJSX && require('@babel/plugin-syntax-jsx'),
    isVueJSX && require('babel-plugin-transform-vue-jsx'),
    // stage-3 features
    require('@babel/plugin-syntax-dynamic-import'),
    [
      require('@babel/plugin-proposal-class-properties'),
      {
        // Enable loose mode to use assignment instead of defineProperty
        loose: true
      }
    ],
    [
      require('@babel/plugin-proposal-object-rest-spread'),
      {
        useBuiltIns: true
      }
    ],
    require('babel-plugin-macros'),
    [
      require('@babel/plugin-transform-runtime'),
      {
        helpers: false,
        regenerator: true,
        absoluteRuntime: path.dirname(
          require.resolve('@babel/runtime/package.json')
        )
      }
    ],
    [
      require('babel-plugin-named-asset-import'),
      {
        loaderMap: Object.assign({}, namedAssetImport, {
          svg: Object.assign(
            {
              ReactComponent: '@svgr/webpack?-prettier,-svgo![path]'
            },
            namedAssetImport && namedAssetImport.svg
          )
        })
      }
    ]
  ].filter(Boolean)

  return {
    presets,
    plugins
  }
}
