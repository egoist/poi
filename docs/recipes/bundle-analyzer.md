# Analyze bundle size

You can add [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer) to generate a zoomable treemap to represent bundle content.

With this plugin you can: 

- Realize what's really inside your bundle
- Find out what modules make up the most of it's size
- Find modules that got there by mistake
- Optimize it!

To use it in your config file:

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
