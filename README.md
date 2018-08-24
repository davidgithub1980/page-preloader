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

A simple page preloader using dedicated web worker.

<h2 align="center">Install</h2>

```
npm install page-preloader
```

<h2 align="center">Usage</h2>

``` javascript
import { PagePreloader } from 'page-preloader';
// or
let { PagePreloader } = require('page-preloader')
```

Example usage:

``` javascript
// use default options
PagePreloader.init()

// use custom options
PagePreloader.init({
    debug: false, 
    // turn on/off debug mode
    // defaults to 'false'
    
    preloadKey: 'uri', 
    // defaults to 'uri'
    // determine key under which to store page data
    // - 'uri' - page data to be stored using string URI as key
    // - 'page' - page data to be stored using page number as key
    
    preloadDelay: 2000,
    // defaults to '2000'
    // [ms] when to start preloading following every page request
    
    cacheDuration: 60000,
    // defaults to '60000'
    // [ms] when to request/refresh data
    
    maxInactivityTicks: 20, 
    // defaults to '20'
    // max attempts before shutdown
    // one attempt/tick is recorded whenever preloaded history remains unchanged
})

PagePreloader.query(origin, endPoint)
// - origin (eg. location.origin) - base url (https://www.foo.baz) to request
// - endPoint - actual requested page fragment (/api/product/find?id=1&page=2)
// Final requested page is to be then: https://www.foo.baz/api/product/find?id=1&page=2

// - data then become available inside global 'window' variable
// - check the global object for preloaded data when requesting new page
window.__preloadedData
```


<h2 align="center">LICENSE</h2>

#### [MIT](./LICENSE)
