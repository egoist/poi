# plugin-offline

Add offline support to your app.

## Install

```bash
yarn add offline-plugin
yarn add @poi/plugin-offline --dev
```

## Usage

```js
// poi.config.js
module.exports = {
  plugins: [require('@poi/plugin-offline')(options)]
}
```

## API

### options

#### options.entry

Type: `string`<br>
Default: `main`

Add offline-plugin runtime to specified entrypoint.

#### options.pwa

Type: `string`<br>
Default: `path.join(__dirname,'pwa.js')`

#### options.pluginOptions

Options for [`offline-plugin`](https://github.com/NekR/offline-plugin).

Default value:

```js
{
  ServiceWorker:{
    events:true,
    navigateFallbackURL:'/'
  },
  AppCache:{
    events:true,
    FALLBACK:{'/':'/'}
  }
}
```

## License

[MIT](https://oss.ninja/mit/egoist) &copy; [EGOIST](https://github.com/egoist)
