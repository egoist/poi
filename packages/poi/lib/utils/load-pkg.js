const path = require('path')
const chokidar = require('chokidar')
const logger = require('@poi/cli-utils/logger')
const JoyCon = require('joycon').default

module.exports = ({ cwd = process.cwd() } = {}) => {
  let pkgData
  let pkgPath
  let watcher

  const inferJSX = () => {
    const deps = Object.assign(
      {},
      pkgData && pkgData.dependencies,
      pkgData && pkgData.devDependencies
    )
    if (deps.vue) {
      process.env.POI_JSX_INFER = 'vue'
    } else if (deps.preact) {
      process.env.POI_JSX_INFER = 'h'
    } else if (deps.mithril) {
      process.env.POI_JSX_INFER = 'm'
    } else {
      delete process.env.POI_JSX_INFER
    }
    logger.debug(`Inferred JSX syntax: ${process.env.POI_JSX_INFER || 'react'}`)
  }

  const updatePkg = () => {
    const joycon = new JoyCon({
      // Only read up to current working directory
      stopDir: path.dirname(process.cwd())
    })
    const res = joycon.loadSync({
      files: ['package.json'],
      cwd
    })

    pkgPath = res.path
    pkgData = res.data || {}
    inferJSX()
  }

  const watchPkg = file => {
    return chokidar
      .watch(file, {
        ignoreInitial: true
      })
      .on('add', () => {
        updatePkg()
        inferJSX()
      })
      .on('unlink', () => {
        pkgData = {}
        pkgPath = null
        inferJSX()
      })
      .on('change', () => {
        logger.debug(`${file} has changed..`)
        updatePkg()
        inferJSX()
      })
  }

  updatePkg()

  return {
    get path() {
      return pkgPath
    },

    get data() {
      return pkgData
    },

    watch(file) {
      watcher =
        watcher || watchPkg(file || pkgPath || path.join(cwd, 'package.json'))
      return watcher
    },

    close() {
      return watcher && watcher.close()
    }
  }
}
