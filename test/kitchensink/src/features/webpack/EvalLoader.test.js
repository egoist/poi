import assert from 'assert'
import { value, html, relativeFile } from './assets/data.eval'

describe('eval js files', () => {
  it('works', () => {
    assert(value === '123\n', 'exec child_process')
    assert(html === '<h1 id=\"hello\">hello</h1>\n', 'exec marked'),
    assert(relativeFile.abstract === 'This is an abstract.', 'relative file')
  })
})
