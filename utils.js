/**
 * Utils
 * @author David Zaba
 *
 */

export const Utils = {

  refreshPagingContext(requestPage, data) {
    let newContent = {}

    for (let target in data) {
      let page = (data[target] && data[target].page) || 1

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
  },
}
