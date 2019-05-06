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

test('react framework', async () => {
  const stream = await sao.mock(
    { generator },
    {
      features: [],
      frameworks: ['react'],
      linterConfig: 'xo'
    }
  )
  expect(stream.fileList).toContain('src/App.js')
  const pkg = JSON.parse(await stream.readFile('package.json'))
  const deps = [...Object.keys(pkg.dependencies)]
  const devDeps = [...Object.keys(pkg.devDependencies)]
  expect(deps).toContain('react')
  expect(deps).toContain('react-dom')
  expect(devDeps).toContain('react-hot-loader')
})

test('react + typescript', async () => {
  const stream = await sao.mock(
    { generator },
    {
      features: ['typeChecker'],
      typeChecker: 'ts',
      frameworks: ['react'],
      linterConfig: 'xo'
    }
  )

  expect(stream.fileList).toContain('tsconfig.json')
  const pkg = JSON.parse(await stream.readFile('package.json'))
  const devDeps = [...Object.keys(pkg.devDependencies)]
  expect(devDeps).toContain('@poi/plugin-typescript')
  expect(devDeps).toContain('typescript')
})
