function arrify(input) {
  return Array.isArray(input) ? input : [input]
}

module.exports = arrify
