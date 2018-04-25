# browserify-webpack-stats

output a webpack-style stats.json with browserify, for use with webpack based bundle analyzer tools

> WIP!

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/browserify-webpack-stats.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/browserify-webpack-stats
[travis-image]: https://img.shields.io/travis/goto-bus-stop/browserify-webpack-stats.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/browserify-webpack-stats
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install browserify-webpack-stats
```

## Usage

```bash
browserify app.js -p browserify-webpack-stats -o bundle.js
webpack-bundle-analyzer stats.json .
```

## License

[Apache-2.0](LICENSE.md)
