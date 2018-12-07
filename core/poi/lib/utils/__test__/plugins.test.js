const { mergePlugins } = require('../plugins')

test('merge', () => {
  expect(
    mergePlugins(
      [{ resolve: 'foo' }, { resolve: 'bar', options: { foo: 'bar' } }],
      [
        {
          resolve: 'foo'
        },
        {
          resolve: 'baz'
        }
      ]
    )
  ).toEqual([
    { resolve: 'foo' },
    { resolve: 'bar', options: { foo: 'bar' } },
    {
      resolve: 'baz'
    }
  ])
})
