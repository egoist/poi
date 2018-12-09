/* globals puppet */
import tape from 'tape'

tape.onFinish(() => {
  puppet.exit(0)
})

tape.onFailure(() => {
  puppet.exit(1)
})
