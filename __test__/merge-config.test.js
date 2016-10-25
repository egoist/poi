const mergeConfig = require('../lib/merge-config')

test('merge file', () => {
  const config = mergeConfig({entry: 'foo'}, {
    mergeConfig: './__test__/fixtures/merge-webpack-config'
  })
  expect(config.entry).toBe('bar')
})

test('merge object', () => {
  const config = mergeConfig({entry: 'foo'}, {
    mergeConfig: {entry: 'bar'}
  })
  expect(config.entry).toBe('bar')
})

test('merge array', () => {
  const config = mergeConfig({entry: 'foo'}, {
    mergeConfig: [
      {entry: 'bar'},
      {target: 'node'}
    ]
  })
  expect(config).toEqual({
    entry: 'bar',
    target: 'node'
  })
})
