const { bundle } = require('@poi/test-utils')
const integration = require('./helpers/integration')

jest.setTimeout(100000)

test('main', async () => {
  const bundler = bundle({
    entry: integration('code-split/index.js'),
    hash: false
  })
  const stats = await bundler.run()
  expect(stats.hasErrors()).toBe(false)
  expect(Object.keys(stats.compilation.assets).sort()).toEqual([
    'index.html',
    'main.js',
    'main.js.map',
    'vendors~main.js',
    'vendors~main.js.map'
  ])
})
