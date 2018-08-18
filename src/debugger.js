/**
 * Debugger
 * @author David Zaba
 *
 */

export function Debugger() {

  /**
   *
   * @type {string}
   */
  const LOG_PREFIX = '| > | PAGE PRELOADER | -'

  /**
   *
   * @param url
   */
  this.logUrlRequest = (url) => {
    console.info(`${LOG_PREFIX} requesting url`, url)
  }

  /**
   *
   * @param store
   */
  this.logStoreUpdate = (store) => {
    console.info(`${LOG_PREFIX} updating store`, store)
  }

  /**
   *
   */
  this.logCacheAttempt = () => {
    console.info(`${LOG_PREFIX} trying to re-cache`)
  }

  /**
   *
   * @param page
   */
  this.logPageCache = (page) => {
    console.info(`${LOG_PREFIX} re-caching page`, page)
  }

  /**
   *
   */
  this.logShutdown = () => {
    console.info(`${LOG_PREFIX} inactivity shutdown`)
  }

  /**
   *
   */
  this.logWorkerWarning = () => {
    console.info(`${LOG_PREFIX} web-worker functionality not suppported`)
  }

  /**
   *
   * @param e
   */
  this.logError = (e) => {
    console.error(`${LOG_PREFIX} error`, e)
  }
}
