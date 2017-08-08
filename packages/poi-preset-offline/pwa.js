import runtime from 'offline-plugin/runtime'

runtime.install({
  onUpdateReady() {
    runtime.applyUpdate()
  },
  onUpdated() {
    console.info('Reload this page to apply updates!')
  }
})
