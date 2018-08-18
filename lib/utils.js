'use strict';

/**
 * Utils
 * @author David Zaba
 *
 */

function Utils() {

  /**
   *
   * @param requestPage
   * @param data
   * @return {{}}
   */
  this.refreshPagingContext = function (requestPage, data) {
    var newContent = {};

    for (var target in data) {
      var page = data[target] && data[target].page || 1;

      if (Number(page) === Number(requestPage)) {
        newContent[target] = data[target];
        newContent[target]['requestPage'] = requestPage;

        continue;
      }

      // load 2 next pages should we be on page 1
      if (Number(requestPage) === 1) {
        if (Number(page) === Number(requestPage) + 1) {
          newContent[target] = data[target];
          newContent[target]['requestPage'] = requestPage;
        } else if (Number(page) === Number(requestPage) + 2) {
          newContent[target] = data[target];
          newContent[target]['requestPage'] = requestPage;
        }

        continue;
      }

      // load prev & next page should we be on page > 1
      if (Number(page) === Number(requestPage) - 1) {
        newContent[target] = data[target];
        newContent[target]['requestPage'] = requestPage;
      } else if (Number(page) === Number(requestPage) + 1) {
        newContent[target] = data[target];
        newContent[target]['requestPage'] = requestPage;
      }
    }

    return newContent;
  };

  /**
   *
   * @param store
   * @return {*}
   */
  this.getFingerprint = function (store) {
    try {
      return Object.keys(store).join('-');
    } catch (e) {
      return '';
    }
  };
}
exports.Utils = Utils;