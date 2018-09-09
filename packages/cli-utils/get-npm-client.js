const path = require('path')
const commandExists = require('command-exists')
const JoyCon = require('joycon').default

module.exports = async cwd => {
  const joycon = new JoyCon()
  const filepath = await joycon.resolve({
    files: ['yarn.lock', 'package-lock.json'],
    cwd,
    stopDir: path.dirname(process.cwd())
  })
  if (filepath) {
    return filepath.endsWith('yarn.lock') ? 'yarn' : 'npm'
  }
  return (await commandExists('yarnpkg')) ? 'yarn' : 'npm'
}
