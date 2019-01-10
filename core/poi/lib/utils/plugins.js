const resolveFrom = require('resolve-from')
const logger = require('@poi/logger')
const isLocalPath = require('./isLocalPath')
const PoiError = require('./PoiError')

const normalizePluginName = (name, cwd) => {
  if (isLocalPath(name)) return name

  // @poi/foo => @poi/plugin-foo
  // @my-org/hehe => @my-org/poi-plugin-hehe
  if (/^@[^/]+\//.test(name)) {
    return name.replace(/^@([^/]+)\/(poi-)?(plugin-)?/, (_, m1) => {
      return m1 === 'poi' ? `@poi/plugin-` : `@${m1}/poi-plugin-`
    })
  }

  const prefixedName = name.replace(/^(poi-plugin-)?/, 'poi-plugin-')

  // if a prefixed name exists, use it directly
  if (resolveFrom.silent(cwd, prefixedName)) {
    return prefixedName
  }

  return name
}

exports.normalizePlugins = (plugins, cwd) => {
  return [].concat(plugins || []).map(v => {
    if (typeof v === 'string') {
      v = { resolve: v }
    }
    if (typeof v.resolve === 'string') {
      const pluginName = normalizePluginName(v.resolve, cwd)
      const resolvedPlugin = resolveFrom.silent(cwd, pluginName)
      if (!resolvedPlugin) {
        const message = `Cannot find plugin \`${pluginName}\` in your project`
        logger.error(message)
        logger.error(`Did you forget to install it?`)
        throw new PoiError({
          message,
          dismiss: true
        })
      }
      v = Object.assign({}, v, {
        resolve: resolvedPlugin
      })
    }
    return v
  })
}

exports.mergePlugins = (configPlugins, cliPlugins) => {
  return configPlugins.concat(
    cliPlugins.filter(cliPlugin => {
      return !configPlugins.find(
        configPlugin => configPlugin.resolve === cliPlugin.resolve
      )
    })
  )
}
