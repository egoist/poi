const { bundle } = require('@poi/test-utils')
const integration = require('./helpers/integration')

test('cjs', async () => {
  const bundler = bundle({
    entry: integration('format-cjs/index.js'),
    format: 'cjs'
  })
  const stats = await bundler.run()
  expect(Object.keys(stats.compilation.assets)).toEqual(['main.js'])
  expect(
    stats.compilation.assets['main.js']._value.startsWith(
      'module.exports=function(e)'
    )
  ).toBe(true)
})
