# Troubleshooting

## Multiple assets emit to the same filename

This usually happens when you try to use `filename` option and build app in production mode, because in production the **auto-splitting for vendor code** is enabled, so there's also `vendor.js` besides your app bundle, to fix this you can disable `vendor` option.

## Can't resolve '__WEBPACK_HOT_MIDDLEWARE_CLIENT__'

You may override `webpackConfig.resolve.alias` in config file, please don't do this since the default aliases are required for bundling.

And `__WEBPACK_HOT_MIDDLEWARE_CLIENT__` is an alias to 'webpack-hot-middleware/client' with custom query string.
