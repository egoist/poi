import test from 'ava'
import * as babel from 'babel-core'

test('main', t => {
  const { code } = babel.transform(`const a = {...foo}`, {
    presets: [require.resolve('..')]
  })
  t.snapshot(code, 'object reset spread')
})
