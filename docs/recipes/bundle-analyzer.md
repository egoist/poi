# Analyze bundle size

You can use [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer) to generate a zoomable treemap to represent bundle content.

With this plugin you can: 

- Realize what's really inside your bundle
- Find out what modules make up the most of it's size
- Find modules that got there by mistake
- Optimize it!


## Use as webpack plugin

To add it in your config file:

```js
// vbuild.config.js
module.exports = options => ({
  webpack(config) {
    // apply this plugin when using `--stats`
    if (options.stats) {
      const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

      config.plugins.push(new BundleAnalyzerPlugin())
    }

    return config
  }
})
```

Then run `vbuild -c --stats` it will open browser for you to preview the stats.

## Use as CLI tool

Alternatively, you don't need to add the plugin to your webpack config, instead you can run `vbuild --json` to generate webpack stats to `./stats.json` file, and then run `webpack-bundle-analyzer` CLI to analyze it:

```bash
yarn global add webpack-bundle-analyzer
vbuild --json
webpack-bundle-analyzer stats.json
```

**Note**: You only need this in production mode, since it doesn't make sense to analyze the bundle file in dev mode.
