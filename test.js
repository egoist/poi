import test from 'ava'
import trash from 'trash'
import exists from 'path-exists'
import vbuild from './lib'

test('main', async t => {
  await trash(['./dist'])
  await vbuild({
    config: false,
    alias: 'example',
    entry: ['./example']
  })
  t.true(await exists('./dist/index.html'))
})

test('production config', async t => {
  await trash(['./dist-cool'])
  await vbuild({
    config: './example/vue.config.json',
    production: {
      dist: 'dist-cool',
      devtool: false
    }
  })
  t.true(await exists('./dist-cool/bundle.xxx.js'))
})
