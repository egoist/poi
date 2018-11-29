const path = require('path')

const resetScript = `
self.addEventListener('install', function(e) {
  self.skipWaiting()
})

self.addEventListener('activate', function(e) {
  self.registration
    .unregister()
    .then(function() {
      return self.clients.matchAll()
    })
    .then(function(clients) {
      clients.forEach(client => client.navigate(client.url))
    })
})

`

// Express-like middleware
module.exports = swPath => (req, res, next) => {
  if (req.url === path.join('/', swPath || 'service-worker.js')) {
    res.setHeader('Content-Type', 'text/javascript')
    res.send(resetScript)
  } else {
    next()
  }
}
