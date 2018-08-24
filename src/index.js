import { FingerprintUtils } from './utils/fingeprint';
import { PagingUtils } from './utils/paging';
import { UrlUtils } from './utils/url';
import { XhrUtils } from './utils/xhr';
import { Debugger } from './debugger';

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
let _PagingUtils = new PagingUtils();
let _Debugger = new Debugger();

// main worker
let _worker;

/**
 *
 * @type {object}
 */
export const PagePreloader = {
  /**
   *
   * @param {object} ops Options
   * @returns {void}
   */
  init (ops = {}) {
    /* eslint max-len: 0 */
    /* eslint max-params: 0 */
    let workerFn = (settings, Debug, UrlHelper, XhrHelper, PagingHelper, FingerprintHelper) => {
      // default request page
      let requestPage = 1;

      // pre-loaded data container
      let store = {};

      // helpers
      const fingerprintUtils = new FingerprintHelper();
      const pagingUtils = new PagingHelper();
      const urlUtils = new UrlHelper();
      const xhrUtils = new XhrHelper();
      const debug = new Debug();

      // prep options
      let options = {
        debug: false,
        preloadKey: 'uri',
        preloadDelay: 2000,
        cacheDuration: 60000,
        maxInactivityTicks: 20
      };

      // extend options
      options = Object.assign(options, settings);

      /**
       * Supervisor to keep data up-to-date
       * @returns {void}
       */
      let supervisePagingData = () => {
        (function _cache () {
          setTimeout(() => {
            /* eslint no-unused-expressions: 0 */
            options.debug && debug.logCacheAttempt();

            // store fingerprint to represent current state of the store
            fingerprintUtils.update(store);

            //
            if (fingerprintUtils.getTicks() > options.maxInactivityTicks) {
              self.postMessage({ action: 'CLEAR_STORE' });
              /* eslint no-unused-expressions: 0 */
              options.debug && debug.logShutdown();
              store = {};

              return;
            }

            for (let endPoint in store) {
              let data = store[endPoint];

              /* eslint max-len: 0 */
              if (xhrUtils.isRequestRecacheable(data.page, data.loadTime, options.cacheDuration)) {
                /* eslint max-len: 0 */
                xhrUtils.pollRemoteSource(data.target, endPoint, data.page, data.requestPage);

                /* eslint no-unused-expressions: 0 */
                options.debug && debug.logUrlRequest(data.target);
                options.debug && debug.logPageCache(data.page);
              }
            }

            _cache();
          }, options.cacheDuration);
        })();
      };

      // -- set data id (identificator)
      xhrUtils.setPreloadKey(options.preloadKey);

      // set messaging fn
      xhrUtils.setMessenger(self.postMessage);

      // listen to external requests
      self.addEventListener('message', (event) => {
        // reload store and do not proceed
        if (event.data && event.data.action === 'RELOAD_STORE') {
          store = event.data.store;
          /* eslint no-unused-expressions: 0 */
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
        let requestUrl = urlUtils.buildRequest(event);

        // iterate pages
        setTimeout(() => {
          pagingUtils.buildPagesToPoll(requestPage).forEach((p) => {
            /* eslint max-len: 0 */
            let endPoint = urlUtils.buildContextualizedEndpoint(event.data.apiEndpoint, p);
            let target = urlUtils.buildContextualizedTarget(requestUrl, p);

            // do not proceed if dataset already cached
            if (store && store[endPoint]) {
              return;
            }

            // perform XHR request
            xhrUtils.pollRemoteSource(target, endPoint, p, requestPage);

            /* eslint no-unused-expressions: 0 */
            options.debug && debug.logUrlRequest(target);
          });
        }, options.preloadDelay);
      });
    };

    try {
      // set up web worker
      let blob = new Blob(
        [`
          (${workerFn.toString()}) (
            ${JSON.stringify(ops)},
            ${Debugger},
            ${UrlUtils.toString()},
            ${XhrUtils.toString()},
            ${PagingUtils.toString()},
            ${FingerprintUtils.toString()}
          )
        `],
        { type: 'application/javascript' }
      );

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
  query (origin, apiEndpoint) {
    if (!_worker) {
      return;
    }

    _worker.postMessage({ origin, apiEndpoint, store: window.__preloadedData });

    _worker.onmessage = (event) => {
      if (event.data.action === 'CLEAR_STORE') {
        window.__preloadedData = {};

        return;
      }

      let { id, requestPage } = event.data;
      window.__preloadedData[id] = { ...event.data };
      /* eslint max-len: 0 */
      window.__preloadedData = _PagingUtils.refreshContext(requestPage, window.__preloadedData);

      _worker.postMessage({
        action: 'RELOAD_STORE',
        store: window.__preloadedData
      });
    };

    _worker.onerror = (e) => {
      _Debugger.logError(e);
    };
  }
};
