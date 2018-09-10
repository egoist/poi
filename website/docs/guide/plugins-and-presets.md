# Plugins and Presets

## Plugins

Plugins are used to extend core features like modifying webpack config, adding a new CLI command, or adding some generators etc.

### Installing Plugins in an Existing Project

The simplest way to install a plugin is using the `poi add` command:

```bash
# Official plugin
poi add @poi/plugin-eslint
# Third-party plugin
poi add poi-plugin-foo
```

The `plugin-` and `poi-plugin` prefixes can be omitted, so the above commands are equivalent to:

```bash
poi add @poi/eslint
poi add foo
```

Basically `poi add` does two things:

- Install the plugin package from npm as `devDependencies` in your project.
- Invoke relevant generators from the plugin.

::: tip
Plugins are automatically loaded if they are included in your `package.json`'s `dependencies` or `devDependencies` property.
:::

### Use Local Plugins

For local plugins (i.e. not installed from npm), like the following one:

`my-plugin.js`:

```js
exports.name = 'sample'

exports.extend = (api, options) => {
  // Do something with api and options
}
```

You can load it via `plugins` option in your `poi.config.js`:

```js
module.exports = {
  plugins: [
    // Directly load your plugin
    require('./my-plugin'),
    // Or use the path to your plugin
    require.resolve('./my-plugin')
  ],

  pluginOptions: {
    // Will be passed to the plugin's `extend` method as the second argument
    sample: {}
  }
}
```

For more information on developing a plugin, see [Plugin Dev Guide](../plugin-dev.md).

## Presets

[TODO]