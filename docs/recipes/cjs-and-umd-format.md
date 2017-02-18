# CommonJS and UMD format

When you're authoring a library, like a Vue component, you may bundle it in two formats:

- `cjs` (commonjs2): User will use this format in a build tool, it excludes all modules in `node_modules` folder from bundled files.
- `umd`: User will use this format directly in browser, all 3rd-party packages will be bundled within.

## `format` option

`format` option can be set via CLI option or config file.

### cjs

```bash
vbuild --format cjs
```

### umd

```bash
vbuild --format umd --module-name Vuex
```

When using `umd` format, you need to set `moduleName` so that user can access it via `window.moduleName`.

## Server bundle

Set webpack target to `node` when using `cjs` format:

```bash
vbuild --format cjs --webpack.target node
```

You can find a typical `server-entry` file [here](https://github.com/vuejs/vue-hackernews-2.0/blob/master/src/server-entry.js).
