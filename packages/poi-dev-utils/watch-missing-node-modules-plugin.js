class WatchMissingNodeModulesPlugin {
  constructor(nodeModulesPath) {
    this.nodeModulesPath = nodeModulesPath
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, callback) => {
      const missingDeps = compilation.missingDependencies
      const nodeModulesPath = this.nodeModulesPath

      // If any missing files are expected to appear in node_modules...
      if (missingDeps.some(file => file.indexOf(nodeModulesPath) !== -1)) {
        // ...tell webpack to watch node_modules recursively until they appear.
        compilation.contextDependencies.push(nodeModulesPath)
      }

      callback()
    })
  }
}

module.exports = WatchMissingNodeModulesPlugin
