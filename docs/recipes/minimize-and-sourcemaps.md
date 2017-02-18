# minimize and sourcemaps

## minimize

This is enabled by default in production mode, you can set `minimize` to `false` to disable.

## sourcemaps

This is enabled by default in both development and production mode

- development mode: it's set to [`eval-source-map`](https://webpack.js.org/configuration/devtool/#devtool)
- production mode: it's set to [`source-map`](https://webpack.js.org/configuration/devtool/#devtool)

To disable it, set `sourceMap` to `false`.

To switch it to another type, set it to one of the values of [devtool](https://webpack.js.org/configuration/devtool/#devtool).
