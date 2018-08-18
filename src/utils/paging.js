
/**
 * Utils
 * @author David Zaba
 *
 */

export function PagingUtils() {

  /**
   *
   * @type {RegExp}
   */
  let pageRegExp = new RegExp(/.*page=(\d+).*/)

  /**
   *
   * @param requestPage
   * @param data
   * @return {{}}
   */
  this.refreshContext = (requestPage, data = {}) => {
    !requestPage && (requestPage = 1)
    let newContent = {}

    for (let target in data) {
      let page = data[target] && data[target].page

      if (!page) {
        continue
      }

      if (Number(page) === Number(requestPage)) {
        newContent[target] = data[target]
        newContent[target]['requestPage'] = requestPage

        continue
      }

      // load 2 next pages should we be on page 1
      if (Number(requestPage) === 1) {
        if
        (Number(page) === Number(requestPage) + 1) {
          newContent[target] = data[target]
          newContent[target]['requestPage'] = requestPage
        }
        else if
        (Number(page) === Number(requestPage) + 2) {
          newContent[target] = data[target]
          newContent[target]['requestPage'] = requestPage
        }

        continue
      }

      // load prev & next page should we be on page > 1
      if
      (Number(page) === Number(requestPage) - 1) {
        newContent[target] = data[target]
        newContent[target]['requestPage'] = requestPage
      }
      else if
      (Number(page) === Number(requestPage) + 1) {
        newContent[target] = data[target]
        newContent[target]['requestPage'] = requestPage
      }
    }

    return newContent
  }

  /**
   *
   * @param data
   * @return {number}
   */
  this.extractCurrentPage = ({ data = {} }) => {
    let apiEndpoint = (data.apiEndpoint && data.apiEndpoint.match(pageRegExp)) || 1

    return Number((apiEndpoint && apiEndpoint[1]) || 1)
  }

  /**
   *
   * @param requestPage
   * @return {[*]}
   */
  this.buildPagesToPoll = (requestPage = 1) => {
    !requestPage && (requestPage = 1)
    requestPage = Math.abs(requestPage)

    // prep prev & next pages
    let prevPage = Math.max(1, requestPage - 1)
    let nextPage = requestPage + 1

    // prep next page
    let pages = [nextPage]

    // prev page only if it is not the current page -> otherwise next 2 pages
    requestPage !== 1 ? pages.push(prevPage) : pages.push(nextPage + 1)

    // pages to poll
    return pages.sort()
  }
}
