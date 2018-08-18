
/**
 * Utils
 * @author David Zaba
 *
 */

export function UrlUtils() {

  /**
   *
   * @type {RegExp}
   */
  let pageRegExp = new RegExp(/(.*page=)(\d+)(.*)/)

  /**
   *
   * @param val
   * @param page
   * @return {string}
   */
  let replacePage = (val, page) => {
    return String(val.replace(pageRegExp, `$1${Math.abs(page)}$3`))
  }

  /**
   *
   * @param data
   * @return {string}
   */
  this.buildRequest = ({ data }) => {
    return (
      data.origin &&
      data.apiEndpoint &&
      String(data.origin.concat(data.apiEndpoint))
      ) || ''
  }

  /**
   *
   * @param url
   * @param page
   */
  this.buildContextualizedTarget = (url, page = 1) => {
    return (url && page && replacePage(url, page)) || ''
  }

  /**
   *
   * @param endpoint
   * @param page
   */
  this.buildContextualizedEndpoint = (endpoint, page = 1) => {
    return (endpoint && page && replacePage(endpoint, page)) || ''
  }
}
