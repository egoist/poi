import path from 'path'
import vbuild from '../lib'

describe('get webpack config', () => {
  process.chdir('./test/fixture')

  describe('entry', () => {
    it('use default entry', () => {
      const config = vbuild().getWebpackConfig()
      expect(config.entry).toEqual({
        client: [path.resolve('index.js')]
      })
    })

    it('use custom entry', () => {
      const entries = [
        'other-entry.js',
        ['other-entry.js', 'index.js'],
        { index: 'entry.js' },
        { foo: ['foo.js', 'bar.js'] }
      ]

      const [a, b, c, d] = entries.map(entry => vbuild({ entry }).getWebpackConfig())

      expect(a.entry).toEqual({
        client: [path.resolve(entries[0])]
      })

      expect(b.entry).toEqual({
        client: entries[1].map(v => path.resolve(v))
      })

      expect(c.entry).toEqual({
        index: [path.resolve('entry.js')]
      })

      expect(d.entry).toEqual({
        foo: ['foo.js', 'bar.js'].map(v => path.resolve(v))
      })
    })

    it('add hmr entry', () => {
      const config = vbuild({
        entry: 'index.js',
        mode: 'development'
      }).getWebpackConfig()

      expect(config.entry).toEqual({
        client: [
          path.join(__dirname, '../lib/dev-client.es6'),
          path.resolve('index.js')
        ]
      })
    })
  })

  describe('output dir', () => {
    it('default dir', () => {
      const config = vbuild().getWebpackConfig()

      expect(config.output.path).toBe(path.resolve('dist'))
    })

    it('custom dir', () => {
      const config = vbuild({ dist: 'foo/bar' }).getWebpackConfig()

      expect(config.output.path).toBe(path.resolve('foo/bar'))
    })

    it('test mode', () => {
      const config = vbuild({ mode: 'test' }).getWebpackConfig()

      expect(config.output.path).toBe(path.resolve('output_test'))
    })

    it('test mode with custom dir', () => {
      const config = vbuild({
        mode: 'test',
        dist: 'foo/bar'
      }).getWebpackConfig()

      expect(config.output.path).toBe(path.resolve('foo/bar'))
    })
  })
})
