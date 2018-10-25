const path = require('path')
const eslint = require('eslint')

const defaultFilesToLint = [`.`]

module.exports = async (files, flags, api) => {
  const cwd = api.resolve()
  const config = Object.assign(
    {
      fix: false,
      extensions: ['.js', '.vue', '.jsx'],
      cwd,
      ignorePattern: [
        // Ignore Poi out dir
        path.relative(cwd, api.resolve(api.config.outDir))
      ],
      globals: ['__DEV__'],
      envs: ['node'],
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module'
        }
      }
    },
    flags
  )
  const engine = new eslint.CLIEngine(config)
  const report = engine.executeOnFiles(
    files.length > 0 ? files : defaultFilesToLint
  )
  if (config.fix) {
    eslint.CLIEngine.outputFixes(report)
  }
  const formatter = flags.format
    ? engine.getFormatter(flags.format)
    : require('eslint-formatter-pretty')
  process.stdout.write(formatter(report.results))
}
