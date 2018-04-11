const chalk = require('chalk')
const getPackageManager = require('detect-package-manager')
const getDeps = require('./getDeps')

module.exports = async obj => {
  if (obj.type === 'MODULE_NOT_FOUND') {
    const { module, location, isFile } = obj
    if (isFile) {
      return `Cannot import file ${chalk.green(
        `"${module}"`
      )} from ${chalk.green(`"${location}"`)}! Are you sure it exists?`
    }

    const { deps, dev } = getDeps(module)
    const pm = await getPackageManager()
    const command = pm === 'yarn' ? 'add' : 'install'
    const devFlag = pm === 'yarn' ? ' --dev' : ' -D'

    return `Cannot find module ${chalk.green(`"${module}"`)} in ${chalk.green(
      `"${location}"`
    )}!\nYou may run ${chalk.cyan(
      `${pm} ${command} ${deps.join(' ')}${dev ? devFlag : ''}`
    )} to install missing dependencies.${
      dev
        ? ''
        : `\nYou may also append${chalk.cyan(
            devFlag
          )} flag for devDependencies.`
    }`
  }

  return obj.message
}
