module.exports = class AppError extends Error {
  constructor(msg) {
    super()
    this.name = this.constructor.name
    this.message = msg
  }
}
