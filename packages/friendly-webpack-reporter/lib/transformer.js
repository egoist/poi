const CANT_RESOLVE_RE = /Can't resolve '([^']+)' in '([^']+)'/
const MODULE_NOT_FOUND_RE = /Cannot find module '([^']+)' in '([^']+)'/

function isFile(file) {
  return /^[./]|(^[a-zA-Z]:)/.test(file)
}

module.exports = error => {
  if (typeof error === 'string') {
    error = {
      message: error
    }
  }

  // Errors thrown by @poi/bs-loader etc
  if (
    error.name === 'ModuleBuildError' &&
    MODULE_NOT_FOUND_RE.test(error.message)
  ) {
    const [, module, location] = MODULE_NOT_FOUND_RE.exec(error.message)
    return {
      type: 'MODULE_NOT_FOUND',
      module,
      isFile: isFile(module),
      location
    }
  }

  if (
    error.name === 'ModuleNotFoundError' &&
    CANT_RESOLVE_RE.test(error.message)
  ) {
    const [, module, location] = CANT_RESOLVE_RE.exec(error.message)
    return {
      type: 'MODULE_NOT_FOUND',
      module,
      isFile: isFile(module),
      location
    }
  }

  return {
    type: 'UNKNOWN',
    message: error.message.trim()
  }
}
