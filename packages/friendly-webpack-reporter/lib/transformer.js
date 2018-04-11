const MODULE_NOT_FOUND_RE = /Can't resolve '([^']+)' in '([^']+)'/

function isFile(file) {
  return /^[./]|(^[a-zA-Z]:)/.test(file)
}

module.exports = error => {
  if (
    error.name === 'ModuleNotFoundError' &&
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

  return {
    type: 'UNKNOWN',
    message: error.message.trim()
  }
}
