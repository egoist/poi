const babel = require('@babel/core')

function snapshot({ title, input }) {
  test(title, () => {
    const { code } = babel.transform(input, {
      presets: [require.resolve('..')]
    })
    expect(code).toMatchSnapshot(title)
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
