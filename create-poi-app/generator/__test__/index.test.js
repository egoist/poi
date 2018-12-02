const path = require('path')
const sao = require('sao')

const generator = path.join(__dirname, '..')

test('defaults', async () => {
  const stream = await sao.mock(
    { generator },
    {
      features: ['linter'],
      linterConfig: 'xo'
    }
  )
  expect(stream.fileList).toContain('.eslintrc.js')
  const pkg = JSON.parse(await stream.readFile('package.json'))
  const deps = [...Object.keys(pkg.devDependencies)]
  expect(deps).toContain('eslint')
  expect(deps).toContain('eslint-config-xo')
  expect(deps).toContain('@poi/plugin-eslint')
  expect(pkg.scripts.lint).toBe('eslint .')
})
