# Webpack Chain

We use [webpack-chain](https://github.com/mozilla-neutrino/webpack-chain) to manage the underlying webpack config, and here's the reason why we use it:

> Webpack's core configuration is based on creating and modifying a potentially unwieldy JavaScript object. While this is OK for configurations on individual projects, trying to share these objects across projects and make subsequent modifications gets messy, as you need to have a deep understanding of the underlying object structure to make those changes.
>
> webpack-chain attempts to improve this process by providing a chainable or fluent API for creating and modifying webpack configurations. Key portions of the API can be referenced by user-specified names, which helps to standardize how to modify a configuration across projects.

## Built-in rules

- [js](/packages/core/rules/js.js)
- [css](/packages/core/rules/css.js)
- [image](/packages/core/rules/image.js)
- [font](/packages/core/rules/font.js)
- [vue](/packages/core/rules/vue.js)

## Built-in plugins

|name|package|options|
|---|---|---|
|watch-missing-node-modules|[WatchMissingNodeModulesPlugin](/packages/core/webpack/WatchMissingNodeModulesPlugin.js)||
|copy-static-files|copy-webpack-plugin||
|hmr|`webpack.HotModuleReplacementPlugin`||
|named-modules|`webpack.NamedModulesPlugin`||
|timefix|time-fix-plugin||
|define|`webpack.DefinePlugin`||
|no-emit-on-errors|webpack/lib/NoEmitOnErrorsPlugin||
|fancy-log|[FancyLogPlugin](/packages/core/webpack/FancyLogPlugin.js)||
