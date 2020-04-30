const { superstruct } = require('superstruct')
const getFileNames = require('./getFileNames')

module.exports = (api, config) => {
  api.logger.debug('Validating config', config)
  const struct = superstruct()

  const entry = struct.optional(struct.union(['string', 'array', 'object']))

  const output = struct(
    {
      dir: 'string',
      sourceMap: 'boolean',
      minimize: 'boolean',
      format: struct.enum(['iife', 'cjs', 'umd']),
      moduleName: struct.optional('string'),
      publicUrl: 'string',
      target: struct.enum([
        'web',
        'node',
        'electron', // Alias to electron-renderer
        'electron-renderer',
        'electron-main',
        'node-webkit',
        'webworker',
        'async-node'
      ]),
      clean: 'boolean',
      fileNames: struct.optional(
        struct.object({
          js: struct.optional('string'),
          css: struct.optional('string'),
          font: struct.optional('string'),
          image: struct.optional('string')
        })
      ),
      html: struct.optional(struct.union(['boolean', 'object']))
    },
    {
      dir: 'dist',
      sourceMap: !api.isProd,
      minimize: api.isProd,
      format: 'iife',
      publicUrl: '/',
      target: 'web',
      default: true,
      clean: true
    }
  )

  const babel = struct(
    {
      jsx: 'string',
      transpileModules: struct.optional(
        struct.list([struct.union(['string', 'regexp'])])
      ),
      namedImports: struct.optional('object'),
      babelrc: struct.optional('boolean'),
      configFile: struct.optional('boolean')
    },
    {
      jsx: 'react'
    }
  )

  const css = struct(
    {
      extract: 'boolean',
      sourceMap: struct.optional('boolean'),
      loaderOptions: struct.optional(
        struct.object({
          css: struct.optional('object'),
          less: struct.optional('object'),
          postcss: struct.optional('object'),
          sass: struct.optional('object'),
          stylus: struct.optional('object')
        })
      )
    },
    {
      extract: api.isProd
    }
  )

  const devServer = struct(
    {
      hot: 'boolean',
      hotOnly: 'boolean?',
      host: 'string',
      port: struct.union(['string', 'number']),
      hotEntries: struct(['string']),
      headers: struct.optional('object'),
      proxy: struct.optional(
        struct.union([
          'string',
          'object',
          'function',
          struct([struct.union(['object', 'function'])])
        ])
      ),
      open: 'boolean',
      historyApiFallback: struct.optional(struct.union(['boolean', 'object'])),
      before: struct.optional('function'),
      after: struct.optional('function'),
      https: struct.optional(struct.union(['boolean', 'object']))
    },
    {
      hot: true,
      // Cloud IDEs use envs
      host: process.env.HOST || '0.0.0.0',
      port: process.env.PORT || 4000,
      hotEntries: [],
      open: false
    }
  )

  const plugins = struct.optional([
    struct.union([
      'string',
      struct({
        resolve: struct.union(['string', 'object']),
        options: struct.optional('object')
      })
    ])
  ])

  const assets = struct(
    {
      inlineImageMaxSize: struct.optional('number')
    },
    {
      inlineImageMaxSize: 5000
    }
  )

  const Struct = struct(
    {
      entry,
      output,
      plugins,
      parallel: 'boolean',
      cache: 'boolean',
      babel,
      css,
      devServer,
      envs: struct.optional('object'),
      constants: struct.optional('object'),
      chainWebpack: struct.optional('function'),
      configureWebpack: struct.optional(struct.union(['object', 'function'])),
      assets,
      publicFolder: struct.union(['string', 'boolean']),
      pages: struct.optional('object')
    },
    {
      cache: true,
      parallel: false,
      publicFolder: 'public'
    }
  )

  const [error, result] = Struct.validate(config)

  if (error) {
    throw error
  }

  result.output.fileNames = Object.assign(
    getFileNames({ useHash: api.isProd, format: result.output.format }),
    result.output.fileNames
  )

  if (!result.entry) {
    if (api.pkg.data.source) {
      api.logger.debug(
        'Using the value of `source` field in `package.json` as app entry'
      )
      result.entry = api.pkg.data.source
    } else {
      api.logger.debug('Using `index` as app entry')
      result.entry = 'index'
    }
  }

  // Always disable cache in test mode
  if (process.env.NODE_ENV === 'test') {
    result.cache = false
  }

  // Ensure publicUrl
  result.output.publicUrl = result.output.publicUrl
    // Must end with slash
    .replace(/\/?$/, '/')
    // Remove leading ./
    .replace(/^\.\//, '')
  if (!api.isProd && /^https?:\/\//.test(result.output.publicUrl)) {
    result.output.publicUrl = '/'
  }

  api.logger.debug('Validated config', result)

  return result
}
