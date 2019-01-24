const templateSettings = require('lodash/templateSettings')

/**
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
