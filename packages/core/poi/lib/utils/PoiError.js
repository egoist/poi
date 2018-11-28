module.exports = class PoiError extends Error {
  constructor({ message, dismiss }) {
    super(message)
    this.dismiss = dismiss
    this.poi = true
  }
}
