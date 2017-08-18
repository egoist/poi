const chalk = require('chalk')

const logger = module.exports = {}

logger.success = (msg, log = true) => {
  msg = `${chalk.reset.inverse.bold.green(' DONE ')} ${msg}`
  return log ? console.log(msg) : msg
}

logger.error = (msg, log = true) => {
  msg = `${chalk.reset.inverse.bold.red(' FAIL ')} ${msg}`
  return log ? console.log(msg) : msg
}

logger.warn = (msg, log = true) => {
  msg = `${chalk.reset.inverse.bold.yellow(' WARN ')} ${msg}`
  return log ? console.log(msg) : msg
}

logger.tip = (msg, log = true) => {
  msg = `${chalk.reset.inverse.bold.cyan(' TIP ')} ${msg}`
  return log ? console.log(msg) : msg
}

logger.title = (label, msg, color = 'blue', log = true) => {
  msg = `${chalk.reset.inverse.bold[color](` ${label} `)} ${msg}`
  return log ? console.log(msg) : msg
}
