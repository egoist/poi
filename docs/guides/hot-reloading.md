# Hot Reloading

Hot reloading (HMR) is enabled in development, a.k.a. the `poi` or `poi dev` command.

## Frameworks

### Vue

HMR works in Vue single-file component out-of-box.

### React

You can use `react-hot-loader` to enable HMR for React components.

First install it:

```bash
yarn add react-hot-loader --dev
```

Then update your `.babelrc`:

```json
{
  "presets": ["poi"],
  "plugins": ["react-hot-loader/babel"]
}
```

Finally mark your root component as hot-exported:

```js
// App.js
import React from 'react'
import { hot } from 'react-hot-loader'

const App = () => <div>Hello World!</div>

export default hot(module)(App)
```
