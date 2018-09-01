
/**
 * Utils
 * @author David Zaba
 *
 */

export function CacheUtils() {

  let store = {};
  let debug = false;
  let duration = 60000;
  let dispatch = Function;
  let maxInactivityTicks = 10;

  /**
   *
   * @param s
   */
  this.setStore = (s) => {
    store = s
  }

  /**
   *
   * @param d
   */
  this.setDebug = (d) => {
    debug = d
  }

  /**
   *
   * @param d
   */
  this.setExpiration = (d) => {
    duration = d
  }

  /**
   *
   * @param m
   */
  this.setMessenger = (m) => {
    dispatch = m
  }

  /**
   *
   * @param t
   */
  this.setMaxInactivityTicks = (t) => {
    maxInactivityTicks = t
  }

  /**
   *
   * @param _debugger
   * @param fingerprintUtils
   * @param xhrUtils
   */
  this.supervise = (_debugger, fingerprintUtils, xhrUtils) => {
    (function _cache () {
      setTimeout(() => {
        /* eslint no-unused-expressions: 0 */
        debug && _debugger.logCacheAttempt();

        // store fingerprint to represent current state of the store
        fingerprintUtils.update(store);

        //
        if (fingerprintUtils.getTicks() > maxInactivityTicks) {
          dispatch({ action: 'CLEAR_STORE' });
          /* eslint no-unused-expressions: 0 */
          debug && _debugger.logShutdown();

          return;
        }

        for (let endPoint in store) {
          let data = store[endPoint];

          /* eslint max-len: 0 */
          if (
            xhrUtils.isRequestReady(data.page) &&
            xhrUtils.isRequestRecacheable(data.loadTime, duration)
          ) {
            /* eslint max-len: 0 */
            xhrUtils.pollRemoteSource(data.target, endPoint, data.page, data.requestPage);

            /* eslint no-unused-expressions: 0 */
            debug && _debugger.logUrlRequest(data.target);
            debug && _debugger.logPageCache(data.page);
          }
        }

        _cache();
      }, duration);
    })();
  };
}
