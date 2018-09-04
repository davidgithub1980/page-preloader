<div align="center">
  <a href="https://github.com/davidgithub1980/page-preloader">
    <img width="200" src="http://drive.google.com/uc?export=view&id=1i7E0fKMq3uGjesasLG3AxM7G_PLK6hOp">
  </a>
  <h1>PAGE PRELOADER</h1>
  
  [![npm version](https://badge.fury.io/js/page-preloader.svg)](https://badge.fury.io/js/page-preloader)
  [![Build Status](https://travis-ci.com/davidgithub1980/page-preloader.png?branch=master)](https://travis-ci.com/davidgithub1980/page-preloader)
  [![codecov](https://codecov.io/gh/davidgithub1980/page-preloader/branch/master/graph/badge.svg)](https://codecov.io/gh/davidgithub1980/page-preloader)
  [![JavaScript Style Guide: Good Parts](https://img.shields.io/badge/code%20style-goodparts-brightgreen.svg?style=flat)](https://github.com/dwyl/goodparts "JavaScript The Good Parts")
  
</div>

A simple page preloader using a dedicated web worker.

## :cloud: Installation

```
npm install page-preloader
```

## :clipboard: Example

``` javascript
import { PagePreloader } from 'page-preloader';
// let { PagePreloader } = require('page-preloader')

// use default options
PagePreloader.init()

PagePreloader.query(origin, endPoint)
// Requested resource base URL (eg. https://www.example.com).
// Requested resource end-point (eg. /api/product/find?id=1&page=1).
// The result URL to be used internallly then: https://www.example.com/api/product/find?id=1&page=1

window.__preloadedData
// Preloaded data are available inside this global variable
// You should negotiate this object before requesting raw data for a new page
```

## :memo: Documentation


### `PagePreloader.init(options)`
Initializes internal flow of code.

Usage:

```js
PagePreloader.init({
    debug: false, // default
    // Turns debug mode on or off.
    
    preloadKey: 'uri', // default
    // Saves preloaded data for a certain page under this key.
    // - 'uri' - saves data using URI string. Example: { '/api/product?id=1&page=1': ..data.. }
    // - 'page' - saves data using page number. Example: { 1: ..data.. }
    
    preloadDelay: 2000, // default
    // Determines delay in [ms] after which to start preloading.
    
    cacheDuration: 60000, // default
    // Determines cache duration in [ms] for preloaded data
    // Once the duration period expires, data are requested again.
    
    maxInactivityTicks: 20, // default
    // Determines ticks for inactivity period.
    // One tick expires whenever preloaded page history remains unchanged following cache expiration.
})
```

#### Params

- **object** `options`: Configuration object.

#### Return
- **void**

### `PagePreloader.query(origin, endPoint)`
Queries requested resource.

Usage:

```js
PagePreloader.query(origin, endPoint)
```

#### Params

- **string** `origin`: Requested resource base URL (eg. https://www.example.com).
- **string** `endPoint`: Requested resource end-point (eg. /api/product/find?id=1&page=1).

#### Return
- **void**

<h2 align="center">LICENSE</h2>

#### [MIT](./LICENSE)
