function unspecifiedAddress(host) {
  return host === '0.0.0.0' || host === '::'
}

module.exports = unspecifiedAddress
