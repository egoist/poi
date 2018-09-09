const path = require('path')
const inq = require('inquirer')
const majo = require('majo')
const chalk = require('chalk')
const install = require('@poi/cli-utils/install-deps')

module.exports = async ({ outDir }) => {
  outDir = path.resolve(outDir)

  let overwrite
  if (await majo.fs.pathExists(outDir)) {
    const res = await inq.prompt([
      {
        name: 'overwrite',
        type: 'confirm',
        default: false
      }
    ])
    overwrite = res.overwrite
    if (!overwrite) {
      return console.log(chalk.yellow(`Aborted!`))
    }
  }

  const answers = await inq.prompt(require('./questions')())
  const { framework, features } = answers
  const fromDir = path.join(__dirname, '../templates', framework)
  const stream = majo()
  stream.source('**/*', { baseDir: fromDir, dotFiles: true })
  await stream.dest(outDir)

  // Write pkg
  const pkgPath = path.join(outDir, 'package.json')
  const useLinter = features.includes('linter')
  const pkgData = {
    private: true,
    scripts: {
      dev: 'poi dev',
      build: 'poi build'
    },
    dependencies: {
      react: framework === 'react' ? '^16.0.0' : undefined,
      'react-dom': framework === 'react' ? '^16.0.0' : undefined,
      vue: framework === 'vue' ? '^2.0.0' : undefined,
      'vue-template-compiler': framework === 'vue' ? '^2.0.0' : undefined,
      '@poi/plugin-eslint': useLinter ? 'next' : undefined
    },
    devDependencies: {
      poi: 'next'
    }
  }
  await majo.fs.writeFile(pkgPath, JSON.stringify(pkgData, null, 2), 'utf8')

  await install({ cwd: outDir })

  // Invoke generators for selected features
  const pm = await require('@poi/cli-utils/get-npm-client')(outDir)
  const poi = require(path.join(outDir, 'node_modules/poi'))
  if (useLinter) {
    await poi({
      command: 'invoke',
      baseDir: outDir,
      cliOptions: { args: ['eslint', '--no-success-message'] }
    }).run()
  }

  console.log(`
${chalk.green.bold('POI')} Created a new ${chalk.cyan(
    framework
  )} project within ${chalk.cyan.underline(
    path.relative(process.cwd(), outDir)
  )} folder.

You can run following commands to start developing:

  cd ${path.relative(process.cwd(), outDir)}
  ${pm} run dev
  `)
}
