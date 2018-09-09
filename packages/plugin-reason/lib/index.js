exports.name = 'reason'

exports.extend = api => {
  api.chainWebpack(config => {
    config.module
      .rule('bs')
      .test(/\.(re|ml)$/)
      .use('bs-loader')
      .loader('@poi/bs-loader')
      .options({
        cwd: api.resolveBaseDir()
      })
  })
}

exports.generators = require('../generators')
