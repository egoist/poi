module.exports = class TimeFixPlugin {
  constructor(timefix = 11000) {
    this.timefix = timefix
  }

  apply(compiler) {
    compiler.plugin('watch-run', (watching, callback) => {
      this.hasWatcher = true
      watching.startTime += this.timefix
      callback()
    })

    compiler.plugin('done', stats => {
      if (this.hasWatcher) {
        stats.startTime -= this.timefix
      }
    })
  }
}
