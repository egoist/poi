const chalk = require('chalk')

const logger = module.exports = {}

logger.success = msg => {
  console.log(chalk.reset.inverse.bold.green(' DONE '), msg)
}

logger.error = msg => {
  console.error(chalk.reset.inverse.bold.red(' FAIL '), msg)
}

logger.warn = msg => {
  console.log(chalk.reset.inverse.bold.yellow(' WARN '), msg)
}

logger.tip = msg => {
  console.log(chalk.reset.inverse.bold.cyan(' TIP '), msg)
}
