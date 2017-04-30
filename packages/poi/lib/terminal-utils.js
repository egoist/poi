const rl = require('readline')

const _ = module.exports = {}

// Convention: "no" should be the conservative choice.
// If you mistype the answer, we'll always take it as a "no".
// You can control the behavior on <Enter> with `isYesDefault`.
_.prompt = function (question, isYesDefault) {
  if (typeof isYesDefault !== 'boolean') {
    throw new TypeError('Provide explicit boolean isYesDefault as second argument.')
  }
  return new Promise(resolve => {
    const rlInterface = rl.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const hint = isYesDefault === true ? '[Y/n]' : '[y/N]'
    const message = question + ' ' + hint + '\n'

    rlInterface.question(message, answer => {
      rlInterface.close()

      const useDefault = answer.trim().length === 0
      if (useDefault) {
        return resolve(isYesDefault)
      }

      const isYes = answer.match(/^(yes|y)$/i)
      return resolve(isYes)
    })
  })
}

_.clear = function () {
  process.stdout.write('\x1Bc')
}
