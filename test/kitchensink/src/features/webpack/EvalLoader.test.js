import { value, html, relativeFile } from './assets/data.eval'

describe('eval js files', () => {
  it('works', () => {
    expect(value).toBe('123\n')
    expect(html).toBe('<h1 id=\"hello\">hello</h1>\n'),
    expect(relativeFile.abstract).toBe('This is an abstract.')
  })
})
