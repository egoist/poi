const output = require('./output')

function formatError(error) {
  if (error.name === 'ModuleNotFoundError' && error.message.indexOf('Can\'t resolve') >= 0) {
    const [, name] = /Can't resolve '([^']+)'/.exec(error.message)
    return {
      type: 'module-not-found',
      payload: name,
      error
    }
  }

  if (error.name === 'ModuleBuildError' && error.message.indexOf('Cannot find module') >= 0) {
    const [, name] = /Cannot find module '([^']+)'/.exec(error.message)
    return {
      type: 'module-not-found',
      payload: name,
      error
    }
  }

  if (/Vue packages version mismatch/.test(error.message)) {
    return {
      type: 'vue-version-mismatch',
      error
    }
  }

  if (cannotUglifyES6(error.message)) {
    return {
      type: 'uglify-error',
      payload: getModuleNameFromPath(error.message),
      error
    }
  }

  return {
    type: 'unknown',
    error
  }
}

function cannotUglifyES6(message) {
  return /from UglifyJs/.test(message) &&
  /Unexpected token:/.test(message)
}

function getModuleNameFromPath(str) {
  const [, name] = /[/\\]node_modules[/\\]([^/\\]+)/.exec(str)
  return name
}

module.exports = errors => {
  errors = errors.map(formatError)
  output(errors)
}
