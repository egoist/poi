# Using CSS

List of CSS transformations:

- `.css`: By PostCSS
- `.scss` `.sass`: By PostCSS and Sass
- `.styl` `.stylus`: By PostCSS and Stylus
- `.less`: By PostCSS and Less

## PostCSS

This works out of the box.

By default we don't use any PostCSS plugins, feel free to add `postcss.config.js` or any kind of PostCSS config file in your project, it will be automatically picked up by Poi.

## Sass/Stylus/Less

For these preprocessors to work, you need to install loader and compiler:

- Sass: `yarn add node-sass sass-loader --dev`
- Stylus: `yarn add stylus stylus-loader`
- Less: `yarn add less less-loader --dev`

## CSS modules

CSS modules is supported by default __without any configuration__, any file ending with `.module.css` `.module.scss` `.module.less` etc will be treat as CSS modules.

## Vue

To use PostCSS in Vue single-file component (`.vue`), no changes are required!

```vue
<style>
body {
  color: red
}
</style>
```

To use Sass/Stylus/Less, you need to set the `lang` attribute:

```vue
<style lang="scss">
.foo {
  .bar {
    color: red;
  }
}
</style>

<style lang="sass">
.foo
  .bar
    color: red;
</style>

<style lang="stylus" src="./external/style.styl">
```
