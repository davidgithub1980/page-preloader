
/**
 * Utils
 * @author David Zaba
 *
 */

export function XhrUtils() {

  /**
   *
   */
  let dispatch = Function

  /**
   *
   * @type {number}
   */
  const XHR_STATE_OK = 4

  /**
   *
   * @type {Array}
   */
  let xhr = []

  /**
   *
   * @return {XMLHttpRequest}
   */
  this.getRequest = () => {
    return new XMLHttpRequest()
  }

  /**
   *
   * @param dispatchFn
   */
  this.setMessenger = (dispatchFn) => {
    dispatch = dispatchFn
  }

  /**
   *
   * @param target
   * @param endPoint
   * @param page
   * @param requestPage
   */
  this.pollRemoteSource = (target, endPoint, page, requestPage) => {
    if (!target || !endPoint || !page || !requestPage) {
      return
    }

    xhr[page] = this.getRequest()
    xhr[page].open('GET', target, true)

    xhr[page].onreadystatechange = () => {
      this.isRequestReady(page) && xhr[page].responseText &&
      dispatch(this.buildResponse(page, requestPage, target, endPoint, xhr[page].responseText))
    }

    xhr[page].send(null)
  }

  /**
   *
   * @param page
   * @return {boolean}
   */
  this.isRequestReady = (page) => {
    return !!(xhr[page] && xhr[page].readyState === XHR_STATE_OK)
  }

  /**
   *
   * @param page
   * @param loadTime
   * @param cacheDuration
   * @return {boolean}
   */
  this.isRequestReacacheable = (page, loadTime = 0, cacheDuration = 0) => {
    return this.isRequestReady(page) && Date.now() - loadTime > cacheDuration
  }

  /**
   *
   * @param page
   * @param requestPage
   * @param target
   * @param endPoint
   * @param data
   * @return {*}
   */
  this.buildResponse = (page, requestPage, target, endPoint, data) => {
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
