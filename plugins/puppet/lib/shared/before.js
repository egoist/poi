/* eslint-env browser */
/* globals puppet */
window.addEventListener('error', e => {
  console.error(e.message)
  console.error(`at ${e.filename}:${e.lineno}:${e.colno}`)
  if (!puppet.watch) {
    puppet.exit(1)
  }
})
