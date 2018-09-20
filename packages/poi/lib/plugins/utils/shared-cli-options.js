module.exports = command => {
  command
    .option('debug', {
      desc: 'Show debug output (default: false)'
    })
    .option('inspect-webpack', {
      desc: 'Print webpack config and quit (default: false)'
    })
    .option('no-progress', {
      desc: 'Show build progress (default: true)'
    })
    .option('jsx', {
      desc: `Choose JSX parser (default: 'react')`
    })
}
