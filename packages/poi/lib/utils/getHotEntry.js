module.exports = hotEntry => {
  if (!hotEntry || hotEntry === true) {
    hotEntry = 'main'
  }
  return [].concat(hotEntry)
}
