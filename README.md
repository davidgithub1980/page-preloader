<div align="center">
  <img width="200" src="https://i.l.hypercdn.sk/cz/data/98/logo.png">
  <h1>PAGE PRELOADER</h1>
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
    // turn debug mode on/off
    
    preloadDelay: 2000, 
    // [ms] when to start preloading following every page request
    
    cacheDuration: 60000,
    // [ms] when to request/refresh data
    
    maxInactivityTicks: 20, 
    // max attempts before shutdown
    // one attempt/tick is recorded whenever preloaded history remains unchanged
})

// - provide current location + URL of the newly requested page
// - the newly requested page must contain paging fragment, i.e. 'page=5'
PagePreloader.query(location.origin, requestUrl)

// - data then become available inside global 'window' variable
// - check the global object for preloaded data when requesting new page
window.__preloadedData
```


<h2 align="center">LICENSE</h2>

#### [MIT](./LICENSE)
