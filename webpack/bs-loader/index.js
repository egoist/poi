const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const { getOptions } = require('loader-utils')

let bsbCommand

function runBuild(cwd /* : string */) /* : Promise<string> */ {
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
  const { cwd } = Object.assign({ cwd: process.cwd() }, getOptions(this))

  if (!bsbCommand) {
    try {
      // eslint-disable-next-line require-atomic-updates
      bsbCommand = require.resolve(
        path.resolve(cwd, 'node_modules/bs-platform/bin/bsb.exe')
      )
    } catch (e) {
      try {
        bsbCommand = require.resolve(path.resolve(cwd, 'node_modules/.bin/bsb'))
      } catch (err) {
        return callback(
          new Error(`Cannot find module 'bs-platform' in '${cwd}'`)
        )
      }
    }
  }

  try {
    await runBuild()
    const outputFile = this.resourcePath.replace(/\.(re|ml)$/, '.bs.js')
    const content = await readFile(outputFile, 'utf8')
    callback(null, content)
  } catch (error) {
    callback(typeof error === 'string' ? new Error(error) : error)
  }
}
