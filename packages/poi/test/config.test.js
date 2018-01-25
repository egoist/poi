const path = require('path')
const poi = require('../lib')

jest.mock('poi-webpack-node-externals', () => jest.fn().mockReturnValue(['externals']))

const oldCwd = process.cwd()

beforeAll(() => {
  process.chdir(path.join(__dirname, 'fixture'))
})

afterAll(() => {
  process.chdir(oldCwd)
})

describe('get webpack config', () => {
  describe('entry', () => {
    it('use default entry', async () => {
      const app = poi()

      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry)
        .toEqual({
          client: [path.resolve('index.js')]
        })
    })

    it('use custom entry', async () => {
      const entries = [
        'other-entry.js',
        ['other-entry.js', 'index.js'],
        { index: 'entry.js' },
        { foo: ['foo.js', 'bar.js'] }
      ]

      const [a, b, c, d] = await Promise.all(entries.map(entry => {
        const app = poi({ entry })
        return app.prepare().then(() => app.createWebpackConfig())
      }))

      expect(a.entry.client)
        .toEqual([path.resolve(entries[0])])

      expect(b.entry.client)
        .toEqual(entries[1].map(v => path.resolve(v)))

      expect(c.entry.index)
        .toEqual([path.resolve('entry.js')])

      expect(d.entry.foo)
        .toEqual(['foo.js', 'bar.js'].map(v => path.resolve(v)))
    })

    it('add hmr entry', async () => {
      const app = poi({
        entry: 'index.js',
        mode: 'development'
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.client)
        .toEqual([
          path.join(__dirname, '../app/dev-client.es6'),
          path.resolve('index.js')
        ])
    })

    it('add hmr entry using option', async () => {
      const app = poi({
        entry: {
          foo: ['foo.js'],
          bar: ['bar.js']
        },
        mode: 'development',
        hotEntry: ['foo', 'bar']
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.foo)
        .toEqual([
          path.join(__dirname, '../app/dev-client.es6'),
          path.resolve('foo.js')
        ])

      expect(config.entry.bar)
        .toEqual([
          path.join(__dirname, '../app/dev-client.es6'),
          path.resolve('bar.js')
        ])
    })
  })

  describe('output dir', () => {
    it('default dir', async () => {
      const app = poi()
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.path).toBe(path.resolve('dist'))
    })

    it('custom dir', async () => {
      const app = poi({ dist: 'foo/bar' })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.path).toBe(path.resolve('foo/bar'))
    })
  })

  describe('copy static files', () => {
    it('copy existing static folder', async () => {
      const app = poi()
      await app.prepare()
      app.createWebpackConfig()

      expect(app.webpackConfig.plugins.has('copy-static-files')).toBe(true)
      expect(app.webpackConfig.plugins.get('copy-static-files').options.length)
        .toBe(1)
    })

    it('accepts object', async () => {
      const app = poi({
        copy: {}
      })
      await app.prepare()
      app.createWebpackConfig()

      expect(app.webpackConfig.plugins.get('copy-static-files').options[0].length)
        .toBe(2)
    })

    it('accepts array', async () => {
      const app = poi({
        copy: [{}, {}]
      })
      await app.prepare()
      app.createWebpackConfig()

      expect(app.webpackConfig.plugins.get('copy-static-files').options[0].length)
        .toBe(3)
    })

    it('could be disabled', async () => {
      const app = poi({
        copy: false
      })
      await app.prepare()
      app.createWebpackConfig()

      expect(app.webpackConfig.plugins.has('copy-static-files'))
        .toBe(false)
    })
  })

  describe('use preset', () => {
    it('in all modes', async () => {
      const preset = poi => {
        poi.extendWebpack(config => {
          config.append('entry.foo', path.resolve(poi.options.cwd, 'haha.js'))
        })
      }
      const app = poi({
        cwd: 'foo',
        presets: preset
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.foo).toEqual([path.resolve('foo', 'haha.js')])
    })

    it('in dev command', async () => {
      const presets = [
        poi => {
          poi.extendWebpack('development', config => {
            config.append('entry.foo', 'foo')
          })
        },
        poi => {
          poi.extendWebpack('development', config => {
            config.append('entry.foo', 'bar')
          })
        }
      ]

      const app = poi({
        mode: 'development',
        presets
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.foo).toEqual(['foo', 'bar'])
    })
  })

  describe('build component', () => {
    const HtmlPlugin = require('html-webpack-plugin')

    it('defaults to cjs', async () => {
      const app = poi({
        component: true
      })

      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.libraryTarget).toBe('commonjs2')
      expect(config.externals).toEqual([['externals'], 'vue', 'babel-runtime'])
      expect(config.plugins.find(v => v instanceof HtmlPlugin)).toBeUndefined()
      expect(config.devtool).toBeUndefined()
    })

    it('allows umd', async () => {
      const app = poi({
        component: 'LibraryName'
      })

      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.libraryTarget).toBe('umd')
      expect(config.output.library).toBe('LibraryName')
      expect(config.plugins.find(v => v instanceof HtmlPlugin)).toBeUndefined()
    })
  })
})
