'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _utils = require('./utils');

var Utils = _utils.Utils;


/**
 * Page Preloader
 * @author David Zaba
 *
 */

// https://benohead.com/cross-domain-cross-browser-web-workers/
// https://stackoverflow.com/questions/21408510/chrome-cant-load-web-worker#33432215

// container to store preloaded data
window.__preloadedData = {};

// helpers
var _Utils = new Utils();

// main worker
var _worker = void 0;

/**
 *
 * @type {object}
 */
var PagePreloader = exports.PagePreloader = {
  /**
   *
   */
  init: function init() {
    var ops = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var workerFn = function workerFn(ops, utils) {
      // default request page
      var requestPage = 1;

      // containers
      var xhr = [];
      var store = {};

      var fingerprint = '';
      var fingerprintTicks = 0;

      // state to represent that XHR is done
      var XHR_STATE_OK = 4;

      // helpers
      utils = new utils();

      // prep options
      var options = {
        debug: false,
        preloadDelay: 2000,
        cacheDuration: 60000,
        maxInactivityTicks: 20

        // extend options
      };options = Object.assign(options, ops);

      // listen to external requests
      self.addEventListener('message', function (event) {
        // reload store and do not proceed
        if (event.data && event.data.action === 'RELOAD_STORE') {
          store = event.data.store;
          options.debug && console.info('| > | PAGE PRELOADER | - updating store', store);

          return;
        }

        // we have a brand-new store so supervise it
        !Object.keys(store || {}).length && supervisePagingData();

        var nextPage = void 0,
            prevPage = void 0;
        var requestUrl = void 0;
        var pages = void 0;

        // extract current page or default to 1
        requestPage = extractCurrentPage(event);

        // build final url to request
        requestUrl = buildRequestUrl(event);

        if (!requestPage) return;

        // prep prev & next pages
        prevPage = Math.max(1, requestPage - 1);
        nextPage = requestPage + 1;

        // prep next page
        pages = [nextPage];

        // prev page only if it is not the current page -> otherwise next 2 pages
        requestPage !== 1 ? pages.push(prevPage) : pages.push(nextPage + 1);

        // iterate pages
        pages.forEach(function (p) {
          (function (_page) {
            setTimeout(function () {
              var endPoint = event.data.apiEndpoint.replace(/(.*page=)(\d+)(.*)/, '$1' + _page + '$3');
              var target = requestUrl.replace(/(.*page=)(\d+)(.*)/, '$1' + _page + '$3');

              // do not proceed if dataset already cached
              if (store && store[endPoint]) {
                return;
              }

              // perform XHR request
              doXHR(target, endPoint, _page);
            }, options.preloadDelay);
          })(p);
        });
      });

      /**
       * Supervisor to keep data up-to-date
       */
      var supervisePagingData = function supervisePagingData() {
        (function _cache() {
          setTimeout(function () {
            options.debug && console.info('| > | PAGE PRELOADER | - trying to re-cache');

            // store fingerprint to represent current state of the store
            var newFingerprint = utils.getFingerprint(store);

            if (fingerprint !== newFingerprint) {
              fingerprint = newFingerprint;
              fingerprintTicks = 0;
            } else {
              fingerprintTicks++;
            }

            //
            if (fingerprintTicks > options.maxInactivityTicks) {
              options.debug && console.info('| > | PAGE PRELOADER | - inactivity shutdown');
              self.postMessage({ action: 'CLEAR_STORE' });
              store = {};

              return;
            }

            for (var endPoint in store) {
              var data = store[endPoint];

              var isRecacheable = xhr[data.page] && xhr[data.page].readyState === XHR_STATE_OK && Date.now() - data.loadTime > options.cacheDuration;

              if (isRecacheable) {
                doXHR(data.target, endPoint, data.page, data.requestPage);
                options.debug && console.info('| > | PAGE PRELOADER | - re-caching page ' + data.page);
              }
            }

            _cache();
          }, options.cacheDuration);
        })();
      };

      /**
       *
       * @param target
       * @param endPoint
       * @param page
       */
      var doXHR = function doXHR(target, endPoint, page) {
        options.debug && console.info('| > | PAGE PRELOADER | - requesting url', target);

        xhr[page] = new XMLHttpRequest();
        xhr[page].open('GET', target, true);

        xhr[page].onreadystatechange = function () {
          xhr[page].readyState === XHR_STATE_OK && xhr[page].responseText && self.postMessage(buildResponse(page, target, endPoint, xhr[page].responseText));
        };

        xhr[page].send(null);
      };

      /**
       *
       * @param data
       * @return {number}
       */
      var extractCurrentPage = function extractCurrentPage(_ref) {
        var data = _ref.data;

        var apiEndpoint = data.apiEndpoint && data.apiEndpoint.match(/.*page=(\d+).*/);

        return Number(apiEndpoint && apiEndpoint[1] || 1);
      };

      /**
       *
       * @param data
       * @return {string}
       */
      var buildRequestUrl = function buildRequestUrl(_ref2) {
        var data = _ref2.data;

        return String(data.origin.concat(data.apiEndpoint));
      };

      /**
       *
       * @param page
       * @param target
       * @param endPoint
       * @param data
       * @return {*}
       */
      var buildResponse = function buildResponse(page, target, endPoint, data) {
        try {
          return {
            page: page,
            target: target,
            endPoint: endPoint,
            requestPage: requestPage,
            loadTime: Date.now(),
            data: JSON.parse(data)
          };
        } catch (e) {
          return {};
        }
      };
    };

    try {
      // set up web worker
      var blob = new Blob(['(' + workerFn.toString() + ')(' + JSON.stringify(ops) + ',' + Utils.toString() + ')'], { type: 'application/javascript' });

      _worker = new Worker(URL.createObjectURL(blob));
    } catch (e) {
      console.info('| > | PAGE PRELOADER | - web-worker functionality not suppported');
      _worker = null;
    }
  },


  /**
   *
   * @param origin
   * @param apiEndpoint
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
      window.__preloadedData = _Utils.refreshPagingContext(requestPage, window.__preloadedData);

      _worker.postMessage({ action: 'RELOAD_STORE', store: window.__preloadedData });
    };

    _worker.onerror = function (e) {
      console.info('| > | PAGE PRELOADER | - error', e);
    };
  }
};