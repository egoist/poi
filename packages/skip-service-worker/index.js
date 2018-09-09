const fs = require('fs')
const path = require('path')

const resetScript = fs.readFileSync(
  path.join(__dirname, 'noop-service-worker.js'),
  'utf-8'
)

// Express-like middleware
module.exports = swPath => (req, res, next) => {
  if (req.url === path.join('/', swPath || 'service-worker.js')) {
    res.setHeader('Content-Type', 'text/javascript')
    res.send(resetScript)
  } else {
    next()
  }
}
