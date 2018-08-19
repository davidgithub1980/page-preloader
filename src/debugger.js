/**
 * Debugger
 * @author David Zaba
 *
 */

export function Debugger () {
  /**
   *
   * @type {string}
   */
  const LOG_PREFIX = '| > | PAGE PRELOADER | -';

  /**
   *
   * @param {string} url Request URL
   * @returns {void}
   */
  this.logUrlRequest = (url) => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} requesting url`, url);
  };

  /**
   *
   * @param {object} store Main store with preloaded data
   * @returns {void}
   */
  this.logStoreUpdate = (store) => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} updating store`, store);
  };

  /**
   *
   * @returns {void}
   */
  this.logCacheAttempt = () => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} trying to re-cache`);
  };

  /**
   *
   * @param {number} page Page to re-cache
   * @returns {void}
   */
  this.logPageCache = (page) => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} re-caching page`, page);
  };

  /**
   *
   * @returns {void}
   */
  this.logShutdown = () => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} inactivity shutdown`);
  };

  /**
   *
   * @returns {void}
   */
  this.logWorkerWarning = () => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} web-worker functionality not suppported`);
  };

  /**
   *
   * @param {object} e Error object
   * @returns {void}
   */
  this.logError = (e) => {
    /* eslint no-console: 0 */
    console.error(`${LOG_PREFIX} error`, e);
  };
}
