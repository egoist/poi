# @poi/plugin-html-entry

This is a built-in Poi plugin which makes Poi support HTML entrypoint.

## Features

### Process local scripts and styles

```html
<link rel="stylesheet" href="./style.css">
<script src="./main.js"></script>
```

Note that only relative paths will be processed by webpack, which means you can use absolute paths like `https://...` or `/static/foo.css` to reference external resources.

### Process certain HTML attributes

It processes certain HTML attributes:

- `<img>`: `src`
- `<image>`: `xlink:href`
- `<video>`: `src` `poster`
- `<source>`: `src`

### Reloading

Modifing HTML entry will trigger a full reload.

### Template Interpolations

Your HTML entry will also be processed by [lodash.template](https://lodash.com/docs/4.17.11#template), see [here](https://poi.js.org/guide/custom-html-template.html#template-data) for available template data.

## License

MIT &copy; EGOIST
