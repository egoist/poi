# @poi/plugin-reason

Use [Reason](https://reasonml.github.io/en/) with Poi.

## Install

```bash
yarn add @poi/plugin-reason bs-platform --dev
```

## How to use

Add this plugin in your `poi.config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: '@poi/plugin-reason'
    }
  ]
}
```

Now you can import `.re` and `.ml` files.
