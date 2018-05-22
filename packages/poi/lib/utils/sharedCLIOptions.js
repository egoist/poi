module.exports = command => {
  command
    .option('out-dir', {
      alias: 'd',
      desc: 'The output directory of bundled files. (default: dist)'
    })
    .option('public-path', {
      desc:
        'Public URL of the output directory when referenced in a browser. (default: /)'
    })
    .option('format', {
      desc: 'Bundle format'
    })
    .option('babel.jsx', {
      desc: 'Controlling how to transform JSX. (default: react)'
    })
    .option('module-name', {
      desc: 'Define module name'
    })
    .option('env', {
      desc: 'Load .env file (default: true)'
    })
    .option('minimize', {
      desc: `Minimize bundle (default: ${command.command.name === 'build'})`,
      alias: 'm'
    })
    .option('progress', {
      desc: 'Toggle progress bar. (default: true)'
    })
    .option('clear-console', {
      desc: `Whether to clear console. (default: true)`
    })
}
