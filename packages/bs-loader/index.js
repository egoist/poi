const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

let bsbCommand

function runBuild(cwd /*: string */) /*: Promise<string> */ {
  return new Promise((resolve, reject) => {
    exec(bsbCommand, { maxBuffer: Infinity, cwd }, (err, stdout, stderr) => {
      const output = `${stdout.toString()}\n${stderr.toString()}`
      if (err) {
        reject(output)
      } else {
        resolve(output)
      }
    })
  })
}

function readFile(...args) {
  return new Promise((resolve, reject) => {
    fs.readFile(...args, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

module.exports = async function() {
  const callback = this.async()

  if (!bsbCommand) {
    try {
      bsbCommand = require.resolve(
        path.resolve('./node_modules/bs-platform/bin/bsb.exe')
      )
    } catch (e) {
      try {
        bsbCommand = require.resolve(path.resolve('./node_modules/.bin/bsb'))
      } catch (err) {
        return callback(
          new Error(`Cannot find module 'bs-platform' in '${process.cwd()}'`)
        )
      }
    }
  }

  try {
    await runBuild()
    const outputFile = this.resourcePath.replace(/\.(re|ml)$/, '.bs.js')
    const content = await readFile(outputFile, 'utf8')
    callback(null, content)
  } catch (err) {
    callback(typeof err === 'string' ? new Error(err) : err)
  }
}
