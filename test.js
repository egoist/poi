import test from 'ava'
import trash from 'trash'
import exists from 'path-exists'
import vbuild from './'

test('main', async t => {
  await trash(['./dist'])
  await vbuild({
    config: true
  })
  t.true(await exists('./dist/index.html'))
})
