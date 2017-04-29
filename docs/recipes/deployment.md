# Deployment

<!-- toc -->

- [Deploy to GitHub pages](#deploy-to-github-pages)
- [Preview the app locally](#preview-the-app-locally)
- [Serve with Node.js and Express](#serve-with-nodejs-and-express)
- [Serve with nginx](#serve-with-nginx)

<!-- tocstop -->

By default in production environment the resource of your app is loaded from root path `/` if `homepage` field was not found in `package.json`. When you're going to deploy the app to a sub path like: `http://example.com/blog`, you need to configure the `homepage` to `/blog/`:

```js
// package.json
{
  "homepage": "/blog/"
}
```

You can also configure `homepage` via CLI or config file, but as `package.json` supports [homepage](https://yarnpkg.com/lang/en/docs/package-json/#toc-homepage) field natively, it looks more semantic this way.

**Note**: this will only take effect in production environment, it's always `/` in development mode.

## Deploy to GitHub pages

As what we mentioned above, ensure that the `homepage` is correct because in most cases you will deploy to `username.github.io/reponame` which is a sub path.

Then you can install [gh-pages](https://github.com/tschaub/gh-pages) locally to deploy the `dist` directory with a single command, and we highly recommend you to configure npm scripts for this:

```bash
yarn add gh-pages --dev
```

```json
{
  "scripts": {
    "dev": "poi",
    "build": "poi build",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

Finally run `npm run deploy` and you're all set.

## Preview the app locally

Since resource is loaded from absolute path, you can't open it directly from your file system but use a static server instead, for Python devs:

```bash
cd dist
python -m SimpleHTTPServer 9000
```

If you're using Node.js, you can use [serve](https://github.com/zeit/serve):

```bash
yarn global add serve
serve dist
```

Note that if you're using history mode in client-side router you will need the `--single` mode in `serve`, otherwise it will be a `404` error:

```bash
serve dist --single
```

## Serve with Node.js and Express

Example code:

```js
const path = require('path')
const express = require('express')

const app = express()

app.use(express.static('./dist'))

// To serve all unknown requests to homepage
// You need this when you're using history mode in client-side router
app.use(require('connect-history-api-fallback')({index: '/'}))

app.get('/', (req, res) => {
  res.sendFile(path.resolve('./dist', 'index.html'))
})

app.listen(9000)
```

## Serve with nginx

Here's an offcial guide from nginx: https://www.nginx.com/resources/admin-guide/serving-static-content/

To enable gzip, add these lines to your `*.conf` file:

```nginx
# enable gzip
gzip on;
# only gzip files that are larger than this size
gzip_min_length 1k;
# compress level (1-10), the bigger the compression is better, but costs more cpu usage
gzip_comp_level 2;
# the file types to compress
gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png;
# adding Vary: Accept-Encoding to Header, recommend to be enabled.
gzip_vary on;
# fuck ie6
gzip_disable "MSIE [1-6]\.";
```

When you're using history mode in client-side router, add following code to your config:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```
