const eslint = require('eslint')
const glob = require('fast-glob')

module.exports = async (files, flags, api) => {
  const cwd = api.resolve()
  const config = Object.assign(
    {
      fix: false,
      cwd,
      baseConfig: {
        parserOptions: {
          ecmaVersion: 2018,
          sourceType: 'module'
        },
        env: {
          node: true
        },
        globals: {
          __DEV__: true
        }
      },
      globInputPaths: false
    },
    flags
  )
  const engine = new eslint.CLIEngine(config)
  files = await glob(
    ['!**/node_modules/**', `!${api.config.outDir}`].concat(
      files.length > 0 ? files : ['**/*.{js,jsx,vue,mjs}']
    ),
    {
      cwd
    }
  )
  const report = engine.executeOnFiles(files)
  if (config.fix) {
    eslint.CLIEngine.outputFixes(report)
  }
  const formatter = flags.format
    ? engine.getFormatter(flags.format)
    : require('eslint-formatter-pretty')
  process.stdout.write(formatter(report.results))
}
