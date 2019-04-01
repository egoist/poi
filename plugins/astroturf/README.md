# @poi/plugin-astroturf

Use [astroturf](https://github.com/4Catalyzer/astroturf) to write css-in-js.

## Install

```bash
yarn add astroturf
yarn add @poi/plugin-astroturf --dev
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

export const App = () => {
  return <div className={style.title}>Hello world</div>
}

const style = css`
  .title {
    font-size: 2em;
  }
`
```

## Options:

- `loaderOptions`: `astroturf/loader` [options](https://github.com/4Catalyzer/astroturf/tree/1741c3e702049f6e75483cd000b439d42e57ef2d#options)
  - `loaderOptions.extension`: Default `.module.css`
