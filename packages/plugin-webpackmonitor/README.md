# plugin-webpackmonitor

Monitoring webpack optimization metrics.

<img src="https://i.loli.net/2017/10/18/59e70bd31a3cc.png" width="600" alt="preview">

## Install

```bash
yarn add @poi/plugin-webpackmonitor --dev
```

## Usage

Activate it in config file `poi.config.js`:

```js
module.exports = {
  plugins: [
    require('@poi/plugin-webpackmonitor')(options)
  ]
}
```

Each time you run `poi build` webpackmonitor will write stats to `.monitor/stats.json`, if you want to launch the dashboard in your browser, you can append `--webpackmonitor` flag to this command.

## Options

### pluginOptions

Type: `object`<br>
Default:

```js
{
  // Path to write stats file
  target: path.resolve('.monitor/stats.json'),
  // The cli flag --webpackmonitor
  launch: poi.argv.webpackmonitor
}
```

Options for [webpack-monitor](https://github.com/webpackmonitor/webpackmonitor).

> **Note:** You may add `.monitor` to `.gitignore` if you don't want to track it in your VCS.

## License

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
