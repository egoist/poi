# poi-preset-storybook

## Install

```bash
yarn add poi-preset-storybook --dev

# Use React?
yarn add @storybook/react --dev
# Use Vue? 
yarn add @storybook/vue --dev
```

You can use `storybook-react` and `storybook-vue` which are drop-in replacements for `@storybook/react` and `@storybook/vue` without unnecessary build dependencies if you want.

## Usage

The first entry will be used as storybook config file, and the second one (optional) will be used as storybook addons file.

```js
// poi.config.js
module.exports = {
  // Use your storybook config as entry
  entry: '.storybook/config.js',
  // If you want storybook addons:
  // entry: ['.storybook/config.js', '.storybook/addons.js']
  presets: [
    require('poi-preset-storybook')()
  ],

  // To use with React:
  // The order matters!
  presets: [
    require('poi-preset-react')(),
    require('poi-preset-storybook')()
  ]
}
```

Then create storybook config file and components:

Just like how the [official storybook guide](https://storybook.js.org/basics/guide-vue/) told you, but without installing storybook cli.

```js
// .storybook/config.js
import { configure } from '@storybook/vue'

function loadStories() {
  // You can require as many stories as you need.
  require('../src/stories')
}

configure(loadStories, module)
```

And your actual story `src/stories/index.js`:

```js
import { storiesOf } from '@storybook/vue'

import Mybutton from './path/to/your/lovely/Button.vue'

storiesOf('MyButton', module)
  .add('round component', () => ({
    components: { MyButton },
    template: '<my-button :rounded="true">rounded</my-button>'
  }))
  .add('jsx', () => ({
    render() {
      return <MyButton>JSX</MyButton>
    }
  }))
```


And you're all set, suffix poi commands with `--storybook` to see it in action:

```bash
poi --storybook
poi build --storybook
```

Here's the source code of [a complete example](https://github.com/poi-examples/storybook-vue-example).

> **Note**: [`templateCompiler`](https://poi.js.org/#/options?id=templatecompiler) is `true` by default in `--storybook` mode.

### Using markdown file

You can import `.md` files and they will be parsed by `markdown-loader` using `marked`, however you might want to use your own loader to parse markdown files:

```js
// poi.config.js
module.exports = {
  extendWebpack(config) {
    config.module.rule('markdown')
      .use('markdown')
        .loader('markdown-it-loader') // Use markdown-it instead
        .options(/* maybe some options */)
  }
}
```

## Options

### managerTemplate

Type: `string`<br>
Default: [`./lib/manager.ejs`](./lib/manager.ejs)

Path to the HTML template for generated `index.html`.

### iframeTemplate

Type: `string`<br>
Default: [`./lib/iframe.ejs`](./lib/iframe.ejs)

Path to the HTML template for generated `iframe.html`.

### markdown

Type: `boolean`<br>
Default: `undefined`

Whether to support `.md` files or not.

## Gotchas

[Vue-devtools does not work for now](https://github.com/storybooks/storybook/issues/1708).

## License

MIT &copy; [EGOIST](https://github.com/egoist)
