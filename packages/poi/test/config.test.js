const path = require('path')
const Poi = require('../lib')

jest.mock('poi-webpack-node-externals', () =>
  jest.fn().mockReturnValue(['externals'])
)

const oldCwd = process.cwd()
const hotDevClient = require.resolve('poi-dev-utils/hotDevClient')

beforeAll(() => {
  process.chdir(path.join(__dirname, 'fixture'))
})

afterAll(() => {
  process.chdir(oldCwd)
})

describe('get webpack config', () => {
  describe('entry', () => {
    it('use default entry', async () => {
      const app = new Poi()

      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry).toEqual({
        main: [path.resolve('index.js')]
      })
    })

    it('use custom entry', async () => {
      const entries = [
        'other-entry.js',
        ['other-entry.js', 'index.js'],
        { index: 'entry.js' },
        { foo: ['foo.js', 'bar.js'] }
      ]

      const [a, b, c, d] = await Promise.all(
        entries.map(entry => {
          const app = new Poi('build', { entry })
          return app.prepare().then(() => app.createWebpackConfig())
        })
      )

      expect(a.entry.main).toEqual([path.resolve(entries[0])])

      expect(b.entry.main).toEqual(entries[1].map(v => path.resolve(v)))

      expect(c.entry.index).toEqual([path.resolve('entry.js')])

      expect(d.entry.foo).toEqual(
        ['foo.js', 'bar.js'].map(v => path.resolve(v))
      )
    })

    it('add hmr entry', async () => {
      const app = new Poi('develop', {
        entry: 'index.js'
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.main).toEqual([
        hotDevClient,
        path.resolve('index.js')
      ])
    })

    it('add hmr entry using option', async () => {
      const app = new Poi('develop', {
        entry: {
          foo: ['foo.js'],
          bar: ['bar.js']
        },
        hotEntry: ['foo', 'bar']
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.foo).toEqual([hotDevClient, path.resolve('foo.js')])

      expect(config.entry.bar).toEqual([hotDevClient, path.resolve('bar.js')])
    })
  })

  describe('output dir', () => {
    it('default dir', async () => {
      const app = new Poi()
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.path).toBe(path.resolve('dist'))
    })

    it('custom dir', async () => {
      const app = new Poi('build', { outDir: 'foo/bar' })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.path).toBe(path.resolve('foo/bar'))
    })
  })

  describe('copy static files', () => {
    it('copy existing static folder', async () => {
      const app = new Poi()
      await app.prepare()
      app.createWebpackConfig()

      expect(app.conpack.plugins.has('copy-static-files')).toBe(true)
      expect(app.conpack.plugins.get('copy-static-files').options.length).toBe(
        1
      )
    })

    it('accepts object', async () => {
      const app = new Poi('build', {
        copy: {}
      })
      await app.prepare()
      app.createWebpackConfig()

      expect(
        app.conpack.plugins.get('copy-static-files').options[0].length
      ).toBe(2)
    })

    it('accepts array', async () => {
      const app = new Poi('build', {
        copy: [{}, {}]
      })
      await app.prepare()
      app.createWebpackConfig()

      expect(
        app.conpack.plugins.get('copy-static-files').options[0].length
      ).toBe(3)
    })

    it('could be disabled', async () => {
      const app = new Poi('develop', {
        copy: false
      })
      await app.prepare()
      app.createWebpackConfig()

      expect(app.conpack.plugins.has('copy-static-files')).toBe(false)
    })
  })

  describe('use plugins', () => {
    it('in all commands', async () => {
      const plugin = poi => {
        poi.extendWebpack(config => {
          config.append('entry.foo', path.resolve(poi.options.cwd, 'haha.js'))
        })
      }
      const app = new Poi('build', {
        cwd: 'foo',
        plugins: plugin
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.foo).toEqual([path.resolve('foo', 'haha.js')])
    })

    it('in dev command', async () => {
      const plugins = [
        poi => {
          poi.extendWebpack(config => {
            if (poi.cli.isCurrentCommand('develop')) {
              config.append('entry.foo', 'foo')
            }
          })
        },
        poi => {
          poi.extendWebpack(config => {
            if (poi.cli.isCurrentCommand('develop')) {
              config.append('entry.foo', 'bar')
            }
          })
        }
      ]

      const app = new Poi('develop', {
        plugins
      })
      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.entry.foo).toEqual(['foo', 'bar'])
    })
  })

  describe('build library', () => {
    const HtmlPlugin = require('html-webpack-plugin')

    it('defaults to cjs', async () => {
      const app = new Poi('build', {
        library: true
      })

      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.libraryTarget).toBe('commonjs2')
      expect(config.externals).toEqual([['externals'], 'vue', 'babel-runtime'])
      expect(config.plugins.find(v => v instanceof HtmlPlugin)).toBeUndefined()
      expect(config.devtool).toBeUndefined()
    })

    it('allows umd', async () => {
      const app = new Poi('build', {
        library: 'LibraryName'
      })

      await app.prepare()
      const config = app.createWebpackConfig()

      expect(config.output.libraryTarget).toBe('umd')
      expect(config.output.library).toBe('LibraryName')
      expect(config.plugins.find(v => v instanceof HtmlPlugin)).toBeUndefined()
    })
  })
})
