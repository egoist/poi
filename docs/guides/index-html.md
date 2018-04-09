# `index.html`

Poi uses [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) to generate `index.html`.

This is the [template file](/packages/poi/lib/index.ejs) we use, basically it automatically injects webpack assets and supports [lodash.template](https://lodash.com/docs#template) syntax.

To customize the options for html-webpack-plugin, check out the [html](/docs/options.md#html) option.
