function stringifyObject(obj) {
  return Object.keys(obj).reduce((curr, next) => {
    curr[next] = JSON.stringify(obj[next])
    return curr
  }, {})
}

module.exports = stringifyObject
