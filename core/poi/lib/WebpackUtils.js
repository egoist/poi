module.exports = class WebpackUtils {
  constructor(api) {
    this.api = api
  }

  get envs() {
    const envs = {}
    // Collect variables starting with `POI_APP_` from `process.env`
    for (const name of Object.keys(process.env)) {
      if (name.startsWith('POI_APP_')) {
        envs[name] = process.env[name]
      }
    }

    Object.assign(envs, this.api.config.envs, {
      NODE_ENV: this.api.mode === 'production' ? 'production' : 'development'
    })

    return envs
  }

  get constants() {
    return Object.assign({}, this.api.config.constants, {
      __PUBLIC_URL__: JSON.stringify(this.api.config.output.publicUrl)
    })
  }

  get CopyPlugin() {
    return require('copy-webpack-plugin')
  }
}
