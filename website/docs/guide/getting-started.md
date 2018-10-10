# Getting Started

First install the *WIP* Poi v11:

```bash
yarn add poi@next --dev
# Or npm
npm i poi@next -D
```

And add `scripts` to your `package.json` like this:

```json
{
  "scripts": {
    "dev": "poi dev",
    "build": "poi build",
  }
}
```

After that, populate `index.js` inside your project:

```js
const el = document.createElement('div')
el.textContent = 'Hello Poi!'

document.body.appendChild(el)
```

Finally just run `yarn dev` and go to `http://localhost:4000`.

