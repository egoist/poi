import assert from 'assert'
import { value } from './assets/data.eval'

describe('eval js files', () => {
  it('works', () => {
    assert(value === '123\n', 'eval-loader should work')
  })
})
