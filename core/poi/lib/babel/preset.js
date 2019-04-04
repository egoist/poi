const path = require('path')
const merge = require('lodash.merge')

const env = process.env.BABEL_ENV || process.env.NODE_ENV
const isTest = env === 'test'

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
  {
    jsx = process.env.POI_JSX || 'react',
    jsxPragmaFrag,
    flow,
    typescript,
    env,
    namedImports = process.env.POI_NAMED_IMPORTS
  } = {}
) => {
  if (typeof namedImports === 'string') {
    namedImports = JSON.parse(namedImports)
  }

  const isVueJSX = jsx === 'vue'
  const isReactJSX = jsx === 'react'
  const isPreactJSX = jsx === 'preact'

  // Enable flow and typescript by default at the same time
  // typescript transforms will only be applied to .ts .tsx files
  const isFlowEnabled = validateBoolOption('flow', flow, true)
  const isTypeScriptEnabled = validateBoolOption('typescript', typescript, true)

  const presets = [
    [
      require('@babel/preset-env'),
      Object.assign(
        {
          modules: isTest ? 'commonjs' : false,
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
        pragma: isReactJSX ? 'React.createElement' : isPreactJSX ? 'h' : jsx,
        pragmaFrag: isReactJSX
          ? 'React.Fragment'
          : isPreactJSX
          ? 'Fragment'
          : jsxPragmaFrag
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
    [
      require('babel-plugin-assets-named-imports'),
      {
        loaderMap: merge(
          {
            svg: {
              ReactComponent: '!@svgr/webpack?-prettier![path]'
            },
            md: {
              ReactComponent: `!babel-loader?${JSON.stringify({
                babelrc: false,
                configFile: false,
                presets: [__filename]
              })}!@mdx-js/loader![path]`
            }
          },
          namedImports
        )
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
    ]
  ].filter(Boolean)

  return {
    presets,
    plugins
  }
}
