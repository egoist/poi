# ESLint

vbuild comes with built-in ESLint support, you can add `--eslint` to run ESLint while building in production mode:

```bash
vbuild --eslint
```

The default config we use for [eslint-loader](https://github.com/MoOx/eslint-loader) is:

```js
{
  configFile: require.resolve('eslint-config-vue-app'),
  useEslintrc: false,
  fix: true
}
```

You can set `eslintConfig` in config file to override this.
