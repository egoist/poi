if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  const { Workbox } = require('workbox-window')

  const workbox = new Workbox(`${process.env.PUBLIC_URL}service-worker.js`)

  const addNotifier = () => {
    const { createSnackbar } = require('@egoist/snackbar')
    require('@egoist/snackbar/dist/snackbar.css')

    const pwaFirstTimeInstallMessage = 'Ready for offline use'
    const pwaUpdateReadyMessage = 'A new version of this app is available'
    const pwaUpdateButtonMessage = 'UPDATE'
    const pwaDismissMessage = 'DISMISS'

    const showUpdateNotifier = () => {
      createSnackbar(pwaUpdateReadyMessage, {
        position: 'right',
        timeout: 20000,
        actions: [
          {
            text: pwaUpdateButtonMessage,
            style: {
              color: 'pink'
            },
            callback(button) {
              button.innerHTML = `<svg width="20" height="20" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg" stroke="#fff"><g transform="translate(1 1)" stroke-width="2" fill="none" fill-rule="evenodd"><circle stroke-opacity=".5" cx="18" cy="18" r="18"/><path d="M2.433 27.037c4.99 8.597 16.008 11.52 24.604 6.53"><animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/></path></g></svg>`
              button.disabled = true

              workbox.addEventListener('controlling', () => {
                window.location.reload()
              })

              workbox.messageSW({ type: 'SKIP_WAITING' })
            }
          }
        ]
      })
    }

    workbox.addEventListener('installed', event => {
      if (!event.isUpdate) {
        createSnackbar(pwaFirstTimeInstallMessage, {
          position: 'right',
          timeout: 5000,
          actions: [
            {
              text: pwaDismissMessage
            }
          ]
        })
      }
    })

    workbox.addEventListener('waiting', () => {
      showUpdateNotifier()
    })
  }

  addNotifier()

  workbox.register()
}
