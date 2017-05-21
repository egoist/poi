const path = require('path')
const LoadConfig = require('../')

describe('babel', () => {
  it('has no config file', () => {
    const loadConfig = new LoadConfig()
    return loadConfig.babel()
      .then(config => {
        expect(config.useConfig).toBe(false)
        expect(config.file).toBeFalsy()
      })
  })

  it('has .babelrc', () => {
    const loadConfig = new LoadConfig({
      cwd: path.join(__dirname, 'fixture/babelrc')
    })

    return loadConfig.babel()
      .then(config => {
        expect(config.file).toBe(path.join(__dirname, 'fixture/babelrc/.babelrc'))
        expect(config.useConfig).toEqual(true)
      })
  })
})

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
