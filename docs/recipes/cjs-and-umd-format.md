# CommonJS and UMD format

When you're authoring a library, like a Vue component, you may bundle it in two formats:

- `cjs` (commonjs2): User will use this format in a build tool, it excludes all modules in `node_modules` folder from bundled files.
- `umd`: User will use this format directly in browser, all 3rd-party packages will be bundled within.

## `format` option

`format` option can be set via CLI option or config file.

Note that when `format` is set, the hash will be excluded from filename.

### cjs

```bash
poi build --format cjs
```

### umd

```bash
poi build --format umd --module-name Vuex
```

When using `umd` format, you need to set `moduleName` so that user can access it via `window.moduleName`.
