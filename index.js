import { Utils } from './utils'

/**
 * Page Pre-loader
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
    let wf = (ops) => {
      // default request page
      let requestPage = 1

      // containers
      let xhr = []
      let store = {}

      const XHR_STATE_OK = 4

      // prep options
      let options = {
        debug: false,
        preloadDelay: 2000,
        cacheDuration: 60000,
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
        setInterval(() => {
          for (let endPoint in store) {
            let data = store[endPoint]

            xhr[data.page] &&
            xhr[data.page].readyState === XHR_STATE_OK &&
            Date.now() - data.loadTime > options.cacheDuration &&
            doXHR(data.target, endPoint, data.page, data.requestPage)
          }
        }, options.cacheDuration)
      }

      supervisePagingData();

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
          xhr[page].readyState === XHR_STATE_OK &&
          xhr[page].responseText &&
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
    }

    // set up web worker
    let blob = new Blob([`(${wf.toString()})(${JSON.stringify(ops)})`], {type: 'application/javascript'})
    _worker = new Worker(URL.createObjectURL(blob))
  },

  /**
   *
   * @param origin
   * @param apiEndpoint
   */
  query(origin, apiEndpoint) {
    _worker.postMessage({ origin, apiEndpoint, store: window.__preloadedData });

    _worker.onmessage = (event) => {
      let { target, endPoint, data, page, requestPage, loadTime } = event.data

      window.__preloadedData[endPoint] = { data, target, page, requestPage, loadTime }
      window.__preloadedData = Utils.refreshPagingContext(requestPage, window.__preloadedData)

      _worker.postMessage({ action: 'RELOAD_STORE', store: window.__preloadedData })
    };

    _worker.onerror = (e) => {
      console.info('| > | PAGE PRELOADER | - error', e);
    };
  },
}
