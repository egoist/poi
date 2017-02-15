# ESLint

Adding ESLint support is as simple as adding a pre loader for `.js` and `.vue` file:

```js
// You config file:
const path = require('path')

module.exports = options => ({
  webpack(config) {
    // Only run eslint in production mode
    if (!options.dev) {
      config.module.rules.push({
        test: /\.(js|vue)$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        exclude: [/node_modules/],
        options: {
          configFile: path.resolve('.eslintrc'),
          useEslintrc: false,
          fix: true
        }
      })
    }
    return config
  }
})
```

Don't forget to install `eslint` `eslint-loader` in your project:

```bash
yarn add eslint eslint-loader --dev
```

For detailed usages on eslint-loader please refer to https://github.com/MoOx/eslint-loader

Finally you can populate a `.eslintrc` in your project to use custom ESLint rules.
