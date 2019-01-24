const templateSettings = require('lodash/templateSettings')

/**
 * Check if a attribute value should be processed by webpack
 * @param {string} input
 * @returns {boolean}
 */
exports.shouldProcess = input => {
  return input && !/^https?:/.test(input) && !input.startsWith('/')
}

// Replace it because posthtml will break `<%%>` usages
exports.replaceEjsDelimeters = input => {
  return input
    .replace(templateSettings.interpolate, exports.wrapData('=$1'))
    .replace(templateSettings.evaluate, exports.wrapData('$1'))
    .replace(templateSettings.escape, exports.wrapData('-$1'))
}

exports.wrapData = data => {
  return `template_start%${data}%template_end`
}

// Normalize slashes in a path
exports.slash = (path, stripTrailing) => {
  if (typeof path !== 'string') {
    throw new TypeError('expected path to be a string')
  }

  if (path === '\\' || path === '/') return '/'

  const len = path.length
  if (len <= 1) return path

  // ensure that win32 namespaces has two leading slashes, so that the path is
  // handled properly by the win32 version of path.parse() after being normalized
  // https://msdn.microsoft.com/library/windows/desktop/aa365247(v=vs.85).aspx#namespaces
  let prefix = ''
  if (len > 4 && path[3] === '\\') {
    const ch = path[2]
    if ((ch === '?' || ch === '.') && path.slice(0, 2) === '\\\\') {
      path = path.slice(2)
      prefix = '//'
    }
  }

  const segs = path.split(/[/\\]+/)
  if (stripTrailing !== false && segs[segs.length - 1] === '') {
    segs.pop()
  }
  return prefix + segs.join('/')
}
