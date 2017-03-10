import 'eventsource-polyfill'
import hotClient from '__WEBPACK_HOT_MIDDLEWARE_CLIENT__'

hotClient.subscribe(event => {
  if (event.action === 'reload') {
    window.location.reload()
  }
})
