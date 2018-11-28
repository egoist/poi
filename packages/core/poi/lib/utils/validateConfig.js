const { superstruct } = require('superstruct')
const getFileNames = require('./getFileNames')

module.exports = (api, config) => {
  const struct = superstruct()

  const entry = struct.optional(
    struct.union(['string', 'array', 'object']),
    'index'
  )

  const output = struct(
    {
      dir: 'string',
      sourceMap: 'boolean',
      minimize: 'boolean',
      format: struct.enum(['iife', 'cjs', 'umd']),
      moduleName: struct.optional('string'),
      publicUrl: 'string',
      target: struct.enum(['browser', 'electron', 'node']),
      clean: 'boolean',
      fileNames: struct.optional(
        struct.object({
          js: struct.optional('string'),
          css: struct.optional('string'),
          chunk: struct.optional('string'),
          font: struct.optional('string'),
          image: struct.optional('string')
        })
      )
    },
    {
      dir: 'dist',
      sourceMap: !api.isProd,
      minimize: api.isProd,
      format: 'iife',
      publicUrl: '/',
      target: 'browser',
      default: true,
      clean: true
    }
  )

  const babel = struct(
    {
      jsx: 'string',
      transpileModules: struct.optional(struct.tuple(['string']))
    },
    {
      jsx: 'react'
    }
  )

  const css = struct(
    {
      extract: 'boolean',
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
      host: 'string',
      port: struct.union(['string', 'number']),
      hotEntries: struct.tuple(['string']),
      proxy: struct.optional(struct.union(['string', 'object', 'function'])),
      open: 'boolean',
      before: struct.optional('function'),
      after: struct.optional('function'),
      https: struct.optional(struct.union(['boolean', 'object']))
    },
    {
      hot: true,
      host: '0.0.0.0',
      port: 4000,
      hotEntries: ['index'],
      open: false
    }
  )

  const Struct = struct(
    {
      entry,
      output,
      plugins: struct.optional([
        struct.object({
          resolve: 'string',
          options: struct.optional('object')
        })
      ]),
      parallel: 'boolean',
      cache: 'boolean',
      babel,
      css,
      devServer
    },
    {
      cache: true,
      parallel: false
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

  return result
}
