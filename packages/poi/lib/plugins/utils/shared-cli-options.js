module.exports = command => {
  command
    .option('inspect-webpack', {
      desc: 'Print webpack config and quit (default: false)'
    })
    .option('debug', {
      desc: 'Show debug output (default: false)'
    })
    .option('progress', {
      desc: 'Show build progress (default: true)'
    })
}
