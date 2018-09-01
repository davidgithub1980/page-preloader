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
  const LOG_SUFFIX = '| > | ---';

  /**
   *
   * @param {string} url Request URL
   * @returns {void}
   */
  this.logUrlRequest = (url) => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} requesting url`, url);
    console.info(`${LOG_SUFFIX}`);
  };

  /**
   *
   * @param {object} store Main store with preloaded data
   * @returns {void}
   */
  this.logStoreUpdate = (store) => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} updating store`, store);
    console.info(`${LOG_SUFFIX}`);
  };

  /**
   *
   * @returns {void}
   */
  this.logCacheAttempt = () => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} trying to re-cache`);
    console.info(`${LOG_SUFFIX}`);
  };

  /**
   *
   * @param {number} page Page to re-cache
   * @returns {void}
   */
  this.logPageCache = (page) => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} re-caching page`, page);
    console.info(`${LOG_SUFFIX}`);
  };

  /**
   *
   * @returns {void}
   */
  this.logShutdown = () => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} inactivity shutdown`);
    console.info(`${LOG_SUFFIX}`);
  };

  /**
   *
   * @returns {void}
   */
  this.logWorkerWarning = () => {
    /* eslint no-console: 0 */
    console.info(`${LOG_PREFIX} web-worker functionality not suppported`);
    console.info(`${LOG_SUFFIX}`);
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
