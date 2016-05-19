import test from 'ava'
import trash from 'trash'
import exists from 'path-exists'
import vbuild from './'

test('main', async t => {
  await trash(['./dist'])
  await vbuild({
    config: false,
    entry: ['./example']
  })
  t.true(await exists('./dist/index.html'))
})

test('production config', async t => {
  await trash(['./dist-cool'])
  await vbuild({
    config: './example/vbuild.js',
    production: {
      dist: 'dist-cool',
      devtool: false
    }
  })
  t.true(await exists('./dist-cool/assets/bundle.xxx.js'))
})
