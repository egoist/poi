const supportsEmoji =
  process.platform !== 'win32' || process.env.TERM === 'xterm-256color'

// Fallback symbols for Windows from https://en.wikipedia.org/wiki/Code_page_437
module.exports = {
  progress: supportsEmoji ? '⏳' : '∞',
  success: supportsEmoji ? '✨' : '√',
  error: supportsEmoji ? '🚨' : '×',
  warning: supportsEmoji ? '⚠️' : '‼'
}
