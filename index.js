import { Utils } from './utils'

/**
 * Page Preloader
 * @author David Zaba
 *
 */

// https://benohead.com/cross-domain-cross-browser-web-workers/
// https://stackoverflow.com/questions/21408510/chrome-cant-load-web-worker#33432215

window.__preloadedData = {}
let _worker

/**
 *
 * @type {object}
 */
export const PagePreloader = {
  /**
   *
   */
  init(ops = {}) {
    let workerFn = (ops) => {
      // default request page
      let requestPage = 1

      // containers
      let xhr = []
      let store = {}

      let fingerprint = ''
      let fingerprintTicks = 0

      // state to represent that XHR is done
      const XHR_STATE_OK = 4

      // prep options
      let options = {
        debug: false,
        preloadDelay: 2000,
        cacheDuration: 60000,
        maxInactivityTicks: 20,
      }

      // extend options
      options = Object.assign(options, ops)

      // listen to external requests
      self.addEventListener('message', (event) => {
        // reload store and do not proceed
        if (event.data && event.data.action === 'RELOAD_STORE') {
          store = event.data.store
          options.debug && console.info('| > | PAGE PRELOADER | - updating store', store)

          return
        }

        // we have a brand-new store so supervise it
        !Object.keys(store || {}).length && supervisePagingData()

        let nextPage, prevPage
        let requestUrl
        let pages

        // extract current page or default to 1
        requestPage = extractCurrentPage(event)

        // build final url to request
        requestUrl = buildRequestUrl(event)

        if (!requestPage)
          return

        // prep prev & next pages
        prevPage = Math.max(1, requestPage - 1)
        nextPage = requestPage + 1

        // prep next page
        pages = [nextPage]

        // prev page only if it is not the current page -> otherwise next 2 pages
        requestPage !== 1 ? pages.push(prevPage) : pages.push(nextPage + 1)

        // iterate pages
        pages.forEach((p) => {
          ((_page) => {
            setTimeout(() => {
              let endPoint = event.data.apiEndpoint.replace(/(.*page=)(\d+)(.*)/, `$1${_page}$3`)
              let target = requestUrl.replace(/(.*page=)(\d+)(.*)/, `$1${_page}$3`)

              // do not proceed if dataset already cached
              if (store && store[endPoint]) {
                return
              }

              // perform XHR request
              doXHR(target, endPoint, _page)
            }, options.preloadDelay)
          })(p)
        })
      })

      /**
       * Supervisor to keep data up-to-date
       */
      let supervisePagingData = () => {
        (function _cache() {
          setTimeout(() => {
            options.debug && console.info('| > | PAGE PRELOADER | - trying to re-cache')

            // store fingerprint to represent current state of the store
            let newFingerprint = getFingerprint(store)

            if (fingerprint !== newFingerprint) {
              fingerprint = newFingerprint
              fingerprintTicks = 0
            } else {
              fingerprintTicks++
            }

            //
            if (fingerprintTicks > options.maxInactivityTicks) {
              options.debug && console.info('| > | PAGE PRELOADER | - inactivity shutdown')
              self.postMessage({ action: 'CLEAR_STORE' })
              store = {}

              return
            }

            for (let endPoint in store) {
              let data = store[endPoint]

              let isRecacheable = (
                xhr[data.page] &&
                xhr[data.page].readyState === XHR_STATE_OK &&
                Date.now() - data.loadTime > options.cacheDuration
              )

              if (isRecacheable) {
                doXHR(data.target, endPoint, data.page, data.requestPage)
                options.debug && console.info('| > | PAGE PRELOADER | - re-caching page ' + data.page)
              }
            }

            _cache()
          }, options.cacheDuration)
        })()
      }

      /**
       *
       * @param target
       * @param endPoint
       * @param page
       */
      let doXHR = (target, endPoint, page) => {
        options.debug && console.info('| > | PAGE PRELOADER | - requesting url', target)

        xhr[page] = new XMLHttpRequest()
        xhr[page].open('GET', target, true)

        xhr[page].onreadystatechange = () => {
          xhr[page].readyState === XHR_STATE_OK && xhr[page].responseText &&
          self.postMessage(buildResponse(page, target, endPoint, xhr[page].responseText))
        }

        xhr[page].send(null)
      }

      /**
       *
       * @param data
       * @return {number}
       */
      let extractCurrentPage = ({ data }) => {
        let apiEndpoint = data.apiEndpoint && data.apiEndpoint.match(/.*page=(\d+).*/)

        return Number((apiEndpoint && apiEndpoint[1]) || 1)
      }

      /**
       *
       * @param data
       * @return {string}
       */
      let buildRequestUrl = ({ data }) => {
        return String(data.origin.concat(data.apiEndpoint))
      }

      /**
       *
       * @param page
       * @param target
       * @param endPoint
       * @param data
       * @return {*}
       */
      let buildResponse = (page, target, endPoint, data) => {
        try {
          return {
            page,
            target,
            endPoint,
            requestPage,
            loadTime: Date.now(),
            data: JSON.parse(data)
          }
        } catch (e) {
          return {}
        }
      }

      /**
       *
       * @param store
       * @return {*}
       */
      let getFingerprint = (store) => {
        try {
          return Object.keys(store).join('-')
        } catch (e) {
          return ''
        }
      }
    }

    try {
      // set up web worker
      let blob = new Blob([`(${workerFn.toString()})(${JSON.stringify(ops)})`], {type: 'application/javascript'})
      _worker = new Worker(URL.createObjectURL(blob))
    } catch (e) {
      console.info('| > | PAGE PRELOADER | - web-worker functionality not suppported')
      _worker = null
    }
  },

  /**
   *
   * @param origin
   * @param apiEndpoint
   */
  query(origin, apiEndpoint) {
    if (!_worker) {
      return
    }

    _worker.postMessage({ origin, apiEndpoint, store: window.__preloadedData });

    _worker.onmessage = (event) => {
      if (event.data.action === 'CLEAR_STORE') {
        window.__preloadedData = {}

        return
      }

      let { endPoint, requestPage } = event.data

      window.__preloadedData[endPoint] = { ...event.data }
      window.__preloadedData = Utils.refreshPagingContext(requestPage, window.__preloadedData)

      _worker.postMessage({ action: 'RELOAD_STORE', store: window.__preloadedData })
    };

    _worker.onerror = (e) => {
      console.info('| > | PAGE PRELOADER | - error', e);
    };
  },
}
