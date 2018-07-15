const tc = require('turbocolor')
const getPackageManager = require('detect-package-manager')
const getDeps = require('./getDeps')

module.exports = async obj => {
  if (obj.type === 'MODULE_NOT_FOUND') {
    const { module, location, isFile } = obj
    if (isFile) {
      return `Cannot import file ${tc.green(`"${module}"`)} from ${tc.green(
        `"${location}"`
      )}! Are you sure it exists?`
    }

    const { deps, dev } = getDeps(module)
    const pm = await getPackageManager()
    const command = pm === 'yarn' ? 'add' : 'install'
    const devFlag = pm === 'yarn' ? ' --dev' : ' -D'

    return `Cannot find module ${tc.green(`"${module}"`)} in ${tc.green(
      `"${location}"`
    )}!\nYou may run ${tc.cyan(
      `${pm} ${command} ${deps.join(' ')}${dev ? devFlag : ''}`
    )} to install missing dependencies.${
      dev
        ? ''
        : `\nYou may also append${tc.cyan(devFlag)} flag for devDependencies.`
    }`
  }

  return obj.message
}
