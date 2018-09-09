exports.name = 'pwa'

exports.extend = api => {
  api.chainWebpack(config => {
    if (api.isCommand('build') && config.entryPoints.has('index')) {
      config.entry('index').add('@/register-service-worker')
    }
  })
}

exports.generators = require('./generators')
