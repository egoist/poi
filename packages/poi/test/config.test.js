import path from 'path'
import poi from '../lib'

const oldCwd = process.cwd()

beforeAll(() => {
  process.chdir('./test/fixture')
})

afterAll(() => {
  process.chdir(oldCwd)
})

describe('get webpack config', () => {
  describe('entry', () => {
    it('use default entry', async () => {
      const app = poi()

      await app.prepare()
      const config = app.getWebpackConfig()

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
        return app.prepare().then(() => app.getWebpackConfig())
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
      const config = app.getWebpackConfig()

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
      const config = app.getWebpackConfig()

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
      const config = app.getWebpackConfig()

      expect(config.output.path).toBe(path.resolve('dist'))
    })

    it('custom dir', async () => {
      const app = poi({ dist: 'foo/bar' })
      await app.prepare()
      const config = app.getWebpackConfig()

      expect(config.output.path).toBe(path.resolve('foo/bar'))
    })
  })

  describe('copy static files', () => {
    it('copy existing static folder', async () => {
      const app = poi()
      await app.prepare()
      const config = app.webpackConfig

      expect(config.plugins.has('copy-static-files')).toBe(true)
      expect(config.plugins.get('copy-static-files').get('args')[0].length)
        .toBe(1)
    })

    it('accepts object', async () => {
      const app = poi({
        copy: {}
      })
      await app.prepare()
      const config = app.webpackConfig

      expect(config.plugins.get('copy-static-files').get('args')[0].length)
        .toBe(2)
    })

    it('accepts array', async () => {
      const app = poi({
        copy: [{}, {}]
      })
      await app.prepare()
      const config = app.webpackConfig

      expect(config.plugins.get('copy-static-files').get('args')[0].length)
        .toBe(3)
    })

    it('could be disabled', async () => {
      const app = poi({
        copy: false
      })
      await app.prepare()
      const config = app.webpackConfig

      expect(config.plugins.has('copy-static-files'))
        .toBe(false)
    })
  })

  describe('use preset', () => {
    it('in all modes', async () => {
      const preset = poi => {
        poi.extendWebpack(config => {
          config.entry('foo')
            .add(path.resolve(poi.options.cwd, 'haha.js'))
        })
      }
      const app = poi({
        cwd: 'foo',
        presets: preset
      })
      await app.prepare()
      const config = app.getWebpackConfig()

      expect(config.entry.foo).toEqual([path.resolve('foo', 'haha.js')])
    })

    it('in dev command', async () => {
      const presets = [
        poi => {
          poi.extendWebpack('development', config => {
            config.entry('foo').add('foo')
          })
        },
        poi => {
          poi.extendWebpack('development', config => {
            config.entry('foo').add('bar')
          })
        }
      ]

      const app = poi({
        mode: 'development',
        presets
      })
      await app.prepare()
      const config = app.getWebpackConfig()

      expect(config.entry.foo).toEqual(['foo', 'bar'])
    })
  })
})
