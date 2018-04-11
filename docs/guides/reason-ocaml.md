# Reason/Ocaml support

Poi uses [BuckleScript](https://bucklescript.github.io/) to compile Reason/Ocaml to JavaScript.

You need to install `bs-platform` and create a `bsconfig.json` in your project:

```bash
yarn add bs-platform --dev
```

[Sample `bsconfig.json`](https://github.com/BuckleScript/bucklescript/blob/master/jscomp/bsb/templates/basic-reason/bsconfig.json):

```json
{
  "name": "whatever",
  "sources": {
    "dir": "src",
    "subdirs": true
  },
  "package-specs": {
    "module": "commonjs",
    "in-source": true
  },
  "suffix": ".bs.js",
  "bs-dependencies": [
  ],
  "warnings": {
    "error": "+101"
  },
  "namespace": true,
  "refmt": 3
}
```

`index.js`:

```js
import { sum } from './sum.re'

console.log(sum(1, 2))
//=> 3
```

`sum.re`:

```reason
let sum = (x, y) => x + y;
```
