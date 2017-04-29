Poi (cli) could infer options for html-webpack-plugin from your `package.json`:

```js
{
  title: pkg.productName || pkg.name,
  description: pkg.description,
  template: // see below
}
```

For the `template` path, Poi will use `$cwd/index.ejs` if it exists, otherwise it fallbacks to [built-in template](/lib/index.ejs).
