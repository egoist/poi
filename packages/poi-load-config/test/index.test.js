const path = require('path')
const LoadConfig = require('../')
const loadPoiConfig = require('../poi')

describe('postcss', () => {
  it('has no config file', () => {
    const loadConfig = new LoadConfig()
    return loadConfig.postcss()
      .then(config => {
        expect(config).toEqual({})
      })
  })

  it('has postcss.config.js', () => {
    const loadConfig = new LoadConfig({
      cwd: path.join(__dirname, 'fixture/postcss')
    })

    return loadConfig.postcss()
      .then(config => {
        expect(config.file).toBe(path.join(__dirname, 'fixture/postcss/postcss.config.js'))
        expect(config.plugins).toHaveLength(1)
      })
  })
})

describe('poi', () => {
  it('has no config file', () => {
    const cwd = path.join(__dirname, 'fixture/poi-no-config')

    return loadPoiConfig({ cwd })
      .then(res => {
        expect(res).toEqual({})
      })
  })

  it('load poi.config.js if it exists', () => {
    const cwd = path.join(__dirname, 'fixture/poi-default-config')

    return loadPoiConfig({ cwd })
      .then(res => {
        expect(res).toEqual({
          path: path.join(cwd, 'poi.config.js'),
          config: { foo: true }
        })
      })
  })

  it('repect package.json', () => {
    const cwd = path.join(__dirname, 'fixture/poi-package-json')
    return loadPoiConfig({ cwd })
      .then(res => {
        expect(res).toEqual({
          path: path.join(cwd, 'package.json'),
          config: { foo: true }
        })
      })
  })
})
