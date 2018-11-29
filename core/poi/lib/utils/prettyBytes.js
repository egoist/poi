module.exports = bytes => {
  return `${(bytes / 1000).toFixed(1)} kB`
}
