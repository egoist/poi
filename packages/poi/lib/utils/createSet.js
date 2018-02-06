function createSet(value) {
  return Array.isArray(value) ? new Set(value) : new Set([value])
}

module.exports = createSet
