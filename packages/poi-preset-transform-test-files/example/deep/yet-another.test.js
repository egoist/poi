import test from 'ava'
import fn from '../'

test('main', t => {
  t.is(fn(), 42)
})
