module.exports = class WebpackUtils {
  constructor(api) {
    this.api = api
  }

  get envs() {
    const envs = {
      NODE_ENV: this.api.mode === 'production' ? 'production' : 'development'
    }

    // Collect variables starting with `POI_APP_` from `process.env`
    for (const name of Object.keys(process.env)) {
      if (name.startsWith('POI_APP_')) {
        envs[name] = process.env[name]
      }
    }

    Object.assign(envs, this.api.config.envs, {
      PUBLIC_URL: this.api.config.output.publicUrl
    })

    return envs
  }

  get constants() {
    return Object.assign({}, this.api.config.constants)
  }

  get CopyPlugin() {
    return require('copy-webpack-plugin')
  }

  addParallelSupport(rule) {
    if (this.api.config.parallel) {
      rule.use('thread-loader').loader(require.resolve('thread-loader'))
    }

    return this
  }

  addCacheSupport(rule, getCacheConfig) {
    if (this.api.config.cache) {
      rule
        .use('cache-loader')
        .loader(require.resolve('cache-loader'))
        .options(getCacheConfig())
    }

    return this
  }
}
