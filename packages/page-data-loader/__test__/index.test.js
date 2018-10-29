const path = require('path')
const { promisify } = require('util')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const req = require('require-from-string')

it('works', async () => {
  const compiler = webpack({
    mode: 'development',
    devtool: false,
    entry: path.join(__dirname, 'fixtures/index.js'),
    output: {
      path: '/',
      filename: 'main.js',
      libraryTarget: 'commonjs2'
    },
    module: {
      rules: [
        {
          resourceQuery: /blockType=page-data/,
          loader: require.resolve('..'),
          options: {
            cacheDir: path.join(__dirname, '.cache')
          }
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        }
      ]
    },
    plugins: [new VueLoaderPlugin()]
  })
  const mfs = new webpack.MemoryOutputFileSystem()
  compiler.outputFileSystem = mfs
  const stats = await promisify(compiler.run.bind(compiler))()
  if (stats.hasErrors() || stats.hasWarnings()) {
    throw new Error(stats.toString())
  }
  const code = mfs.readFileSync('/main.js', 'utf8')
  expect(code).toMatchSnapshot()
  const exported = req(code)
  expect(exported.foo.__pageData()).toMatchSnapshot('foo')
  expect(exported.user.__pageData({ user: 'egoist' })).toMatchSnapshot(
    'user egoist'
  )
  expect(exported.user.__pageData({ user: 'cristiano' })).toMatchSnapshot(
    'user cristiano'
  )
})
