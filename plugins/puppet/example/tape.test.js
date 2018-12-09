import test from 'tape'

test('it should work', t => {
  t.plan(1)
  t.equal(1, 1)
})

test('works too', t => {
  t.plan(1)
  setTimeout(() => {
    t.equal(2, 2)
  }, 500)
})
