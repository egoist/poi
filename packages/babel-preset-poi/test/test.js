import test from 'ava'
import * as babel from 'babel-core'

function snapshot({ title, input }) {
  test(title, t => {
    const { code } = babel.transform(input, {
      presets: [require.resolve('..')]
    })
    t.snapshot(code, title)
  })
}

snapshot({
  title: 'object reset spread',
  input: 'const a = {...foo}'
})

snapshot({
  title: 'decorators legacy',
  input: `@bound class Foo {}`
})

snapshot({
  title: 'class properties',
  input: 'class Foo {state = 1}'
})
