const { spawn } = require('croatia')

module.exports = (cmd, args, opts) => {
  return spawn(
    cmd,
    args,
    Object.assign({}, opts, {
      env: Object.assign(
        {
          // Enable colors in chalk
          FORCE_COLOR: true
        },
        process.env,
        opts && opts.env
      )
    })
  )
}
