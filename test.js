import test from 'ava'
import trash from 'trash'
import exists from 'path-exists'
import vbuild from './'

test('main', async t => {
  await trash(['./dist'])
  await vbuild({
    entry: './example'
  })
  t.true(await exists('./dist/index.html'))
})

test('production config', async t => {
  await trash(['./dist-cool'])
  await vbuild({
    entry: './example',
    production: {
      filename: 'hahaha.js',
      dist: 'dist-cool',
      devtool: false
    }
  })
  t.true(await exists('./dist-cool/assets/hahaha.js'))
})
