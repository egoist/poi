const path = require('path')
const { launchBrowser, run } = require('poi-test-utils')

jest.setTimeout(30000)

let launched
test('build', async () => {
  await run(['build'], {
    cwd: path.join(__dirname, 'fixture')
  })
  launched = await launchBrowser(path.join(__dirname, 'fixture/dist'))
  // eslint-disable-next-line no-undef
  const html = await launched.page.evaluate(() => document.querySelector('#app').innerHTML)
  expect(html).toBe('hi')
})

afterAll(() => launched.stop())
