'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utilsFingeprint = require('./utils/fingeprint');

var FingerprintUtils = _utilsFingeprint.FingerprintUtils;

var _utilsPaging = require('./utils/paging');

var PagingUtils = _utilsPaging.PagingUtils;

var _utilsUrl = require('./utils/url');

var UrlUtils = _utilsUrl.UrlUtils;

var _utilsXhr = require('./utils/xhr');

var XhrUtils = _utilsXhr.XhrUtils;

var _debugger = require('./debugger');

var Debugger = _debugger.Debugger;


/**
 * Page Preloader
 * @author David Zaba
 *
 */

// https://benohead.com/cross-domain-cross-browser-web-workers/
/* eslint max-len: 0 */
// https://stackoverflow.com/questions/21408510/chrome-cant-load-web-worker#33432215

// container to store preloaded data
window.__preloadedData = {};

// helpers
var _PagingUtils = new PagingUtils();
var _Debugger = new Debugger();

// main worker
var _worker = void 0;

/**
 *
 * @type {object}
 */
var PagePreloader = exports.PagePreloader = {
  /**
   *
   * @param {object} ops Options
   * @returns {void}
   */
  init: function init() {
    var ops = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    /* eslint max-len: 0 */
    /* eslint max-params: 0 */
    var workerFn = function workerFn(settings, Debug, UrlHelper, XhrHelper, PagingHelper, FingerprintHelper) {
      // default request page
      var requestPage = 1;

      // pre-loaded data container
      var store = {};

      // helpers
      var fingerprintUtils = new FingerprintHelper();
      var pagingUtils = new PagingHelper();
      var urlUtils = new UrlHelper();
      var xhrUtils = new XhrHelper();
      var debug = new Debug();

      // prep options
      var options = {
        debug: false,
        preloadDelay: 2000,
        cacheDuration: 60000,
        maxInactivityTicks: 20
      };

      // extend options
      options = Object.assign(options, settings);

      // set messaging fn
      xhrUtils.setMessenger(self.postMessage);

      // listen to external requests
      self.addEventListener('message', function (event) {
        // reload store and do not proceed
        if (event.data && event.data.action === 'RELOAD_STORE') {
          store = event.data.store;
          options.debug && debug.logStoreUpdate(store);

          return;
        }

        // we have a brand-new store so supervise it
        !Object.keys(store || {}).length && supervisePagingData();

        // extract current page or default to 1
        requestPage = pagingUtils.extractCurrentPage(event);

        if (!requestPage) {
          return;
        }

        // build final url to request
        var requestUrl = urlUtils.buildRequest(event);

        // iterate pages
        setTimeout(function () {
          pagingUtils.buildPagesToPoll(requestPage).forEach(function (p) {
            /* eslint max-len: 0 */
            var endPoint = urlUtils.buildContextualizedEndpoint(event.data.apiEndpoint, p);
            var target = urlUtils.buildContextualizedTarget(requestUrl, p);

            // do not proceed if dataset already cached
            if (store && store[endPoint]) {
              return;
            }

            // perform XHR request
            xhrUtils.pollRemoteSource(target, endPoint, p, requestPage);
            options.debug && debug.logUrlRequest(target);
          });
        }, options.preloadDelay);
      });

      /**
       * Supervisor to keep data up-to-date
       * @returns {void}
       */
      var supervisePagingData = function supervisePagingData() {
        (function _cache() {
          setTimeout(function () {
            options.debug && debug.logCacheAttempt();

            // store fingerprint to represent current state of the store
            fingerprintUtils.update(store);

            //
            if (fingerprintUtils.getTicks() > options.maxInactivityTicks) {
              self.postMessage({ action: 'CLEAR_STORE' });
              options.debug && debug.logShutdown();
              store = {};

              return;
            }

            for (var endPoint in store) {
              var data = store[endPoint];

              /* eslint max-len: 0 */
              if (xhrUtils.isRequestReacacheable(data.page, data.loadTime, options.cacheDuration)) {
                /* eslint max-len: 0 */
                xhrUtils.pollRemoteSource(data.target, endPoint, data.page, data.requestPage);
                options.debug && debug.logUrlRequest(data.target);
                options.debug && debug.logPageCache(data.page);
              }
            }

            _cache();
          }, options.cacheDuration);
        })();
      };
    };

    try {
      // set up web worker
      var blob = new Blob(['\n          (' + workerFn.toString() + ') (\n            ' + JSON.stringify(ops) + ',\n            ' + Debugger + ',\n            ' + UrlUtils.toString() + ',\n            ' + XhrUtils.toString() + ',\n            ' + PagingUtils.toString() + ',\n            ' + FingerprintUtils.toString() + '\n          )\n        '], { type: 'application/javascript' });

      _worker = new Worker(URL.createObjectURL(blob));
    } catch (e) {
      _Debugger.logWorkerWarning();
      _worker = null;
    }
  },


  /**
   *
   * @param {string} origin Original domain
   * @param {string} apiEndpoint API fragment
   * @returns {void}
   */
  query: function query(origin, apiEndpoint) {
    if (!_worker) {
      return;
    }

    _worker.postMessage({ origin: origin, apiEndpoint: apiEndpoint, store: window.__preloadedData });

    _worker.onmessage = function (event) {
      if (event.data.action === 'CLEAR_STORE') {
        window.__preloadedData = {};

        return;
      }

      var _event$data = event.data,
          endPoint = _event$data.endPoint,
          requestPage = _event$data.requestPage;


      window.__preloadedData[endPoint] = _extends({}, event.data);
      /* eslint max-len: 0 */
      window.__preloadedData = _PagingUtils.refreshContext(requestPage, window.__preloadedData);

      _worker.postMessage({
        action: 'RELOAD_STORE',
        store: window.__preloadedData
      });
    };

    _worker.onerror = function (e) {
      _Debugger.logError(e);
    };
  }
};