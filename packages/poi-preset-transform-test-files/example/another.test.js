import test from 'ava'
import fn from './'

test('another', t => {
  t.snapshot(fn())
})
