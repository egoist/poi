const chalk = require('chalk')
const spawn = require('./spawn')
const getNpmClient = require('./get-npm-client')
const icon = require('./icon')

module.exports = async ({ cwd, deps, saveDev, title }) => {
  const pm = await getNpmClient(cwd)

  title = title || 'Installing dependencies'
  const args = deps ? ['add'].concat(deps) : ['install']
  const devFlags = saveDev ? (pm === 'yarn' ? ['--dev'] : ['-D']) : []
  const cp = await spawn(pm, args.concat(devFlags), {
    cwd,
    banner: chalk.bold(
      `${icon.gear} ${title} ${
        deps ? deps.map(v => chalk.cyan(v)).join(', ') + ' ' : ''
      }with ${pm}, this might take a while...`
    )
  })
  if (cp.exitCode !== 0) {
    console.log(
      chalk.red(
        `The command '${cp.spawnargs.join(
          ' '
        )}' has failed, you can run it youself later.`
      )
    )
    process.exitCode = cp.exitCode
  }
}
