const NativeModule = require('module')

module.exports = async function(source, map) {
  this.cacheable()
  const done = this.async()

  const exec = (code, filename) => {
    delete require.cache[filename]
    const module = new NativeModule(filename, this)
    module.paths = NativeModule._nodeModulePaths(this.context)
    module.filename = filename
    module._compile(transpileEsModules(code, filename), filename)
    return module.exports.default || module.exports
  }

  try {
    const exported = exec(source, this.resourcePath)
    const result = await exported.call(this)
    done(null, `${JSON.stringify(result)}`, map)
  } catch (error) {
    done(error)
  }
}

function transpileEsModules(code, filename) {
  const RE = /\b(import|export)\b/
  if (!RE.test(code)) {
    return code
  }
  // Use babel-preset-env to transpile potentional `import/export` statements
  return require('@babel/core').transform(code, {
    filename,
    babelrc: false,
    configFile: false,
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: {
            node: 'current'
          }
        }
      ]
    ]
  }).code
}
