const path = require('path')
const express = require('express')
const puppeteer = require('puppeteer')
const serveStatic = require('serve-static')
const getPort = require('get-port')
const execa = require('execa')

const _ = (module.exports = {})

_.run = (args, options) => {
  const script = path.join(require.resolve('poi/package'), '../bin/main.js')
  return execa('node', [script].concat(args), {
    ...options,
    env: {
      ...options.env,
      // Could be any string other than `TEST`
      BABEL_ENV: 'NON_TEST'
    }
  })
}

_.launchBrowser = dir => {
  return puppeteer.launch().then(async browser => {
    const port = await getPort()
    const app = express()
    app.use(serveStatic(dir, { index: ['index.html'] }))
    let server
    const [page] = await Promise.all([
      browser.newPage(),
      new Promise(resolve => {
        server = app.listen(port, () => resolve())
      })
    ])
    await page.goto(`http://localhost:${port}`)
    return {
      page,
      stop: async () => {
        server.close()
        await browser.close()
      }
    }
  })
}
