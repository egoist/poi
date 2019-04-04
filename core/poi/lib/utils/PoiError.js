module.exports = class PoiError extends Error {
  constructor(message) {
    const options = typeof message === 'string' ? { message } : message
    super(options.message)
    this.dismiss = options.dismiss
    this.poi = true
  }
}
