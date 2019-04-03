# @poi/plugin-astroturf

Use [astroturf](https://github.com/4Catalyzer/astroturf) to write CSS in JS with zero-runtime.

## Install

```bash
yarn add astroturf @poi/plugin-astroturf --dev
```

## How to use

In your `poi.config.js`:

```js
module.exports = {
  plugins: [
    {
      resolve: '@poi/plugin-astroturf',
      options: {}
    }
  ]
}
```

Then write css-in-js:

```jsx
import { css } from 'astroturf'

const style = css`
  .title {
    font-size: 2em;
  }
`
export const App = () => {
  return <div className={style.title}>Hello world</div>
}
```

Check out [astroturf](https://github.com/4Catalyzer/astroturf/) for more usages.

## Options

- `loaderOptions`: `astroturf/loader` [options](https://github.com/4Catalyzer/astroturf/tree/1741c3e702049f6e75483cd000b439d42e57ef2d#options)
  - `loaderOptions.extension`: Default `.module.css`. You can also change it to `.scss` or `.module.scss` etc to use [CSS pre-processors](https://poi.js.org/guide/pre-processing-css.html), but make sure that it ends with `.module.xxx` if you want CSS modules support.

## License

MIT.
