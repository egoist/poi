const path = require('path')
const textTable = require('text-table')
const chalk = require('chalk')
const bytes = require('bytes')
const logger = require('@poi/logger')
const getPackageManager = require('detect-package-manager')

const DEPS = {
  'graphql-tag/loader': {
    deps: ['graphql-tag'],
    dev: true
  },
  'sass-loader': {
    deps: ['node-sass', 'sass-loader'],
    dev: true
  },
  'less-loader': {
    deps: ['less', 'less-loader'],
    dev: true
  },
  'stylus-loader': {
    deps: ['stylus', 'stylus-loader'],
    dev: true
  },
  'better-coffee-loader': {
    deps: ['coffeescript', 'better-coffee-loader'],
    dev: true
  }
}

function getDeps(name) {
  return DEPS[name] || { deps: [name], dev: false }
}

function isModule(file) {
  return !/^[./]|(^[a-zA-Z]:)/.test(file)
}

const MODULE_NOT_FOUND_RE = /Can't resolve '([^']+)' in '([^']+)'/

async function handlError({ errors }) {
  for (const error of errors) {
    if (
      error.name === 'ModuleNotFoundError' &&
      MODULE_NOT_FOUND_RE.test(error.message)
    ) {
      const [, name, loc] = MODULE_NOT_FOUND_RE.exec(error.message)
      if (isModule(name)) {
        logger.error(
          `Cannot find module ${chalk.green(`"${name}"`)} in ${chalk.green(
            `"${loc}"`
          )}!`
        )
        const { deps, dev } = getDeps(name)
        const pm = await getPackageManager()
        const command = pm === 'yarn' ? 'add' : 'install'
        const devFlag = pm === 'yarn' ? ' --dev' : ' -D'
        logger.log(
          `Run ${chalk.cyan(
            `${pm} ${command} ${deps.join(' ')}${dev ? devFlag : ''}`
          )} to install missing dependencies.`
        )
      } else {
        logger.error(
          `Failed to import file ${chalk.green(`"${name}"`)} in ${chalk.green(
            `"${loc}"`
          )}! Are you sure it exists?`
        )
      }
    } else {
      logger.error(
        // Internal stacks are generally useless so we strip them
        chalk.red(
          error.message.replace(
            /^\s*at\s((?!webpack:).)*:\d+:\d+[\s)]*(\n|$)/gm,
            ''
          )
        )
      )
    }
  }
}

module.exports = class ReportStatusPlugin {
  constructor(options) {
    this.options = options
  }

  apply(compiler) {
    compiler.hooks.done.tap('report-status', stats => {
      if (stats.hasErrors()) {
        handlError(stats.compilation)
      } else if (stats.hasWarnings()) {
        console.log(
          stats.toString({
            colors: true,
            assets: false,
            chunks: false,
            modules: false,
            version: false,
            hash: false,
            children: false,
            timings: false,
            builtAt: false
          })
        )
      } else if (this.options.command === 'build') {
        console.log(
          textTable(
            stats.toJson().assets.map(asset => {
              return [
                `${chalk.dim(
                  `${path.relative(
                    process.cwd(),
                    compiler.options.output.path
                  )}/`
                )}${chalk.green(asset.name)}`,
                chalk[asset.isOverSizeLimit ? 'red' : 'cyan'](
                  bytes(asset.size, { unitSeparator: ' ' })
                )
              ]
            })
          )
        )
      }
    })
  }
}
