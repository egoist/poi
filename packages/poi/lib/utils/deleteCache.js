const path = require('path')

// We might cache something like poi config files
// So we need to delete on a restart
function deleteCache() {
  // For now we only need to delete cache for package.json
  // Since we use `export.readPkg()` which will cache it
  // But we don't delete cache for files like `poi.config.js`
  // Since they're never cached!
  // See https://github.com/egoist/use-config/blob/c9c55952ca83106d11ca3353e1729a593d316ae5/index.js#L18-L24
  delete require.cache[path.resolve('package.json')]
}

module.exports = deleteCache
