const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const MFS = require('memory-fs')

function build(file) {
  const config = {
    entry: path.join(__dirname, 'fixture', file),
    output: {
      path: '/',
      publicPath: '/',
      filename: 'main.js'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: require.resolve('../lib/nodent-loader')
        }
      ]
    }
  }
  const compiler = webpack(config)
  const mfs = new MFS()
  compiler.outputFileSystem = mfs
  return new Promise((resolve, reject) => {
    compiler.run(err => {
      if (err) return reject(err)
      resolve({
        input: fs.readFileSync(config.entry, 'utf8'),
        output: mfs.readFileSync('/main.js', 'utf8')
      })
    })
  })
}

function snapshot(title, { file }) {
  test(title, async () => {
    const { input, output } = await build(file)
    expect(`${input}\n\n⬇⬇⬇\n\n${output}`).toMatchSnapshot()
  })
}

snapshot('basic', {
  file: 'input.js'
})
