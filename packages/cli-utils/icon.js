const supportsEmoji =
  process.platform !== 'win32' || process.env.TERM === 'xterm-256color'

module.exports = {
  gear: supportsEmoji ? '⚙ ' : '►',
  success: supportsEmoji ? '🎉 ' : '√',
  invoking: supportsEmoji ? '🏗 ' : '►'
}
