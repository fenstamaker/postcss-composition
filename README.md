# PostCSS Composition [![Build Status][ci-img]][ci]

[PostCSS] PostCSS plugin to compose multiple CSS selectors together like CSS modules.
Primarily meant to be used with Tachyons or other atomic CSS. Currently useable, but
still in heavy development.

[PostCSS]: https://github.com/postcss/postcss
[ci-img]:  https://travis-ci.org/fenstamaker/postcss-composition.svg
[ci]:      https://travis-ci.org/fenstamaker/postcss-composition

```css
.foo {
    /* Input example */
}
```

```css
.foo {
  /* Output example */
}
```

## Usage

```js
postcss([ require('postcss-composition') ])
```

See [PostCSS] docs for examples for your environment.
