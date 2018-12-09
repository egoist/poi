# @poi/plugin-puppet ![status beta](https://badgen.net/badge/status/beta/pink)

Easy automatic (headless) browser testing, powered by [Puppeteer](https://github.com/GoogleChrome/puppeteer).

<img src="https://unpkg.com/@egoist/media/projects/poi/puppet.svg" width="500" alt="preview">

## Install

```bash
yarn add @poi/plugin-puppet --dev
```

<sup><small>*Require Poi 12.0.2 and above.*</small></sup>

## How to use

Add this plugin in `poi.config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: '@poi/plugin-puppet'
    }
  ]
}
```

Now you can bundle your code and run it in browser:

```js
// cowsay.js
import * as cowsay from 'cowsay'

// You can use window.*, since this will be run in Chromium
const text = window.atob('SSBydW4gaW4gYSBicm93c2Vy')

// Everything logged here will be piped to your host terminal
console.log(cowsay.say({ text }))

// Explicitly terminate the script when you are done
puppet.exit()
```

This command will inject`puppet` command to the Poi CLI, you need to use this command in `--test` mode:

```bash
❯ poi puppet --test cowsay.js
 ____________________
< I run in a browser >
 --------------------
        \   ^__^
         \  (oo)\_______
            (__)\       )\/\
                ||----w |
                ||     ||
✔ All tests have passed!
```

### Testing Frameworks

This plugin also works with some popular testing frameworks like [Mocha](https://mochajs.org/) and [Tape](https://github.com/substack/tape), check out the CLI usages.

## CLI Usages

### `poi puppet --test [...files]`

#### `[...files]`

- Type: `string[]`
- Default: `**/*.test.{js,ts}`

One or more glob patterns for matching test files. `node_modules` is always excluded.

#### `--no-headless`

Don't run Chromium in headless mode.

#### `--framework <framework>`

- Type: `string`
- Values: `mocha` `tape`

Use a testing framework.

For **Mocha**: you don't need addtional dependencies, `window.mocha` is available in your code. [Here's the code example.](https://github.com/egoist/poi/blob/master/plugins/puppet/example/mocha.test.js)<br>
For **Tape**: you need to install `tape` in your project since you need to import it in your code. [Here's the code example.](https://github.com/egoist/poi/blob/master/plugins/puppet/example/tape.test.js)

#### `--ui <ui>`

- Type: `string`
- Values: `bdd` `tdd` `qunit`
- Default: `bdd`

Set user-interface for mocha.

## Caveats

This is just for unit testing (maybe for now).

## Credits

This plugin is inspired by [puppet-run](https://github.com/andywer/puppet-run) which is built upon Parcel bundler.
