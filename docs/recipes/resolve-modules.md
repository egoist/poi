# Resolve modules without dot hell

In a large project you may have a deep nested folder structure, for example, if you want to require `$project/src/components/Header.vue` in `$project/src/views/Home/guest/index.vue`, you have to write something like:

```js
import Header from '../../component/Header'
```

It's easy to make mistake by introducing the [dot hell](https://github.com/substack/browserify-handbook#avoiding-).

Instead, you can require it from the root:

```js
import Header from 'src/components/Header.vue'
```

Much more readable right? You can tell where the imported module is at the first glance of the code. All the folders and files in current working directory is require-able.

Alternatively, as many people use `src` folder as the main directory for their app, you can also use `@` to indicate the path to `src` folder, then it becomes:

```js
import Header from '@/components/Header.vue'
```

If you're using another folder instead of `src`, set `appDir` option to that folder:

```bash
vbuild --dev --app-dir front-end/app
```
