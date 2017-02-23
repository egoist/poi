import {getConfig} from '../lib'

describe('get webpack config', () => {
  process.chdir('./test/fixture')

  describe('entry', () => {
    it('use default entry', async () => {
      const {webpackConfig} = await getConfig()
      expect(webpackConfig.entry).toEqual({
        client: ['index.js']
      })
    })

    it('use custom entry', async () => {
      const entries = [
        'other-entry.js',
        ['other-entry.js', 'index.js'],
        {index: 'entry.js'}
      ]

      const [a, b, c] = await Promise.all(entries.map(entry => getConfig({entry}).then(config => config.webpackConfig)))

      expect(a.entry).toEqual({
        client: ['other-entry.js']
      })

      expect(b.entry).toEqual({
        client: ['other-entry.js', 'index.js']
      })

      expect(c.entry).toEqual({
        index: ['entry.js']
      })
    })
  })
})
