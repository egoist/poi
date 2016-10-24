'use strict'
const rl = require('readline')

const _ = module.exports = {}

// Convention: "no" should be the conservative choice.
// If you mistype the answer, we'll always take it as a "no".
// You can control the behavior on <Enter> with `isYesDefault`.
_.prompt = function(question, isYesDefault) {
  if (typeof isYesDefault !== 'boolean') {
    throw new Error('Provide explicit boolean isYesDefault as second argument.')
  }
  return new Promise(resolve => {
    let rlInterface = rl.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    let hint = isYesDefault === true ? '[Y/n]' : '[y/N]'
    let message = question + ' ' + hint + '\n'

    rlInterface.question(message, function(answer) {
      rlInterface.close();

      let useDefault = answer.trim().length === 0
      if (useDefault) {
        return resolve(isYesDefault);
      }

      let isYes = answer.match(/^(yes|y)$/i)
      return resolve(isYes)
    })
  })
}

let isFirstClear = true;
_.clearConsole = function clearConsole() {
  // On first run, clear completely so it doesn't show half screen on Windows.
  // On next runs, use a different sequence that properly scrolls back.
  process.stdout.write(isFirstClear ? '\x1bc' : '\x1b[2J\x1b[0f')
  isFirstClear = false
}