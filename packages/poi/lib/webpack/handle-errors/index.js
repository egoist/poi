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

  if (error.name === 'ModuleBuildError' && error.message.indexOf('ReferenceError: Unknown plugin') >= 0 && error.message.indexOf('babel-core') >= 0) {
    const [, name, location] = /Unknown plugin "([^"]+)" specified in "([^"]+)"/.exec(error.message)
    return {
      type: 'babel-plugin-not-found',
      payload: {
        name,
        location
      },
      error
    }
  }

  if (error.name === 'ModuleBuildError' && error.message.indexOf(`Error: Couldn't find preset`) >= 0 && error.message.indexOf('babel-core') >= 0) {
    const [, name, location] = /Couldn't find preset "([^"]+)" relative to directory "([^"]+)"/.exec(error.message)
    return {
      type: 'babel-preset-not-found',
      payload: {
        name,
        location
      },
      error
    }
  }

  if (error.stack && error.stack.indexOf('eslint-loader') >= 0) {
    return {
      type: 'eslint-error',
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
    const { kind, payload } = getModuleNameFromPath(error.message)
    return {
      type: 'uglify-error',
      payload,
      kind,
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
  /Unexpected (token|character)/.test(message)
}

function getModuleNameFromPath(str) {
  const matchModule = /[/\\]node_modules[/\\]([^/\\]+)/.exec(str)
  if (matchModule) return { kind: 'module', payload: matchModule[1] }

  const matchFile = /\[([^:]+):[^\]]+\]/.exec(str)
  if (matchFile) return { kind: 'file', payload: matchFile[1] }
}

module.exports = errors => {
  errors = errors.map(formatError)
  output(errors)
}
