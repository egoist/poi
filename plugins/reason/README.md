# @poi/plugin-reason

Use [Reason](https://reasonml.github.io/) in your JavaScript apps.

## Install

```bash
yarn add @poi/plugin-reason bs-platform --dev
```

## How to use

In your `poi.config.js`:

```js
module.exports = {
  entry: './src/index.re',
  plugins: [
    {
      resolve: '@poi/plugin-reason'
    }
  ]
}
```

Then add a `bsconfig.json` in your project:

```js
{
  "name": "whatever",
  "sources": {
    "dir": "src",
    "subdirs": true
  },
  "package-specs": {
    "module": "commonjs",
    "in-source": true
  },
  "suffix": ".bs.js",
  "bs-dependencies": [
  ],
  "warnings": {
    "error": "+101"
  },
  "namespace": true,
  "refmt": 3
}
```

And the entry file `src/index.re`:

```reason
print_endline("Hello World");
```
