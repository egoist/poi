const resolveFrom = require('resolve-from')

module.exports = cwd => {
  let eslint
  try {
    eslint = resolveFrom(cwd, 'eslint')
  } catch (err) {
    eslint = 'eslint'
  }
  return eslint
}
