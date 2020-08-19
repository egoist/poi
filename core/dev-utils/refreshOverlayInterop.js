const {
  dismissRuntimeErrors,
  reportRuntimeError
} = require('react-error-overlay')

module.exports = {
  clearRuntimeErrors: dismissRuntimeErrors,
  handleRuntimeError: reportRuntimeError
}
