const fs = require('fs')

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

  try {
    const outputFile = this.resourcePath.replace(/\.(re|ml)$/, '.bs.js')
    const content = await readFile(outputFile, 'utf8')
    callback(null, content)
  } catch (error) {
    callback(typeof error === 'string' ? new Error(error) : error)
  }
}
