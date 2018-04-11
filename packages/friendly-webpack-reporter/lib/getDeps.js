const DEPS = {
  'graphql-tag/loader': {
    deps: ['graphql-tag'],
    dev: true
  },
  'sass-loader': {
    deps: ['node-sass', 'sass-loader'],
    dev: true
  },
  'less-loader': {
    deps: ['less', 'less-loader'],
    dev: true
  },
  'stylus-loader': {
    deps: ['stylus', 'stylus-loader'],
    dev: true
  },
  'better-coffee-loader': {
    deps: ['coffeescript', 'better-coffee-loader'],
    dev: true
  },
  'bs-loader': {
    deps: ['bs-loader', 'bs-platform'],
    dev: true
  },
  'bs-platform': {
    deps: ['bs-platform'],
    dev: true
  }
}

module.exports = function(name) {
  return DEPS[name] || { deps: [name], dev: false }
}
