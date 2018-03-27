module.exports = class PoiError extends Error {
  constructor(msg) {
    super(msg)
    this.name = 'PoiError'
  }
}
