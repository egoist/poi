module.exports = command => {
  command
    .option('debug', {
      desc: 'Show debug output (default: false)'
    })
    .option('inspect-webpack', {
      desc: 'Print webpack config and quit (default: false)'
    })
    .option('no-progress', {
      desc: 'Hide build progress (default: true)'
    })
    .option('jsx', {
      desc: `Choose JSX parser (default: 'react')`
    })
    .option('no-clear-console', {
      desc: `Don't clear console (default: true)`
    })
}
