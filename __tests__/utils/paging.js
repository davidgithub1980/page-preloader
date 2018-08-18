import { PagingUtils } from '../../src/utils/paging'

/**
 * Test Suite
 */
describe('Utils/Paging Service', () => {

  let Utils;

  /**
   * before ech IT spec
   */
  beforeEach(() => {
    Utils = new PagingUtils();
  })

  /**
   * specs
   */
  it('succeeds to extract current page', () => {
    [
      {
        result: 1
      },

      {
        data: {
          apiEndpoint: '/api/product/find?id=1'
        },

        result: 1
      },

      {
        data: {
          apiEndpoint: '/api/product/find?id=1&page='
        },

        result: 1
      },

      {
        data: {
          apiEndpoint: '/api/product/find?id=1&page=2'
        },

        result: 2
      },

      {
        data: {
          apiEndpoint: '/api/product/find?id=1&page=foo'
        },

        result: 1
      },

      {
        data: {
          apiEndpoint: '/api/product/find?id=1&page=3&foo=baz'
        },

        result: 3
      },

      {
        data: {
          apiEndpoint: '/api/product/find?id=1&page=-5&foo=baz'
        },

        result: 1
      },

      {
        data: {
          apiEndpoint: '/api/product/find?id=1&page=52&foo=baz'
        },

        result: 52
      },
    ].forEach((testSet) => {
      expect(Utils.extractCurrentPage(testSet))
        .toEqual(testSet.result)
    })
  })

  /**
   * specs
   */
  it('build pages to poll', () => {
    [
      {
        result: [2, 3],
      },

      {
        requestPage: 0,
        result: [2, 3],
      },

      {
        requestPage: 1,
        result: [2, 3],
      },

      {
        requestPage: 2,
        result: [1, 3],
      },

      {
        requestPage: 2,
        result: [1, 3],
      },

      {
        requestPage: 2,
        result: [1, 3],
      },

      {
        requestPage: -20,
        result: [19, 21],
      },
    ].forEach((testSet) => {
      expect(Utils.buildPagesToPoll(testSet.requestPage))
        .toEqual(testSet.result)
    })
  })

  /**
   * specs
   */
  it('succeeds to refresh paging context', () => {
    [
      {
        requestPage: 1,
        result: {},
      },

      // ---
      {
        requestPage: 1,
        data: {
          '/api/product/find?Id=100&page=10': {
            page: 10,
            target: 'https://www.foo.com/api/product/find?Id=100&page=10',
          },
        },

        result: {},
      },

      // ---
      {
        requestPage: 1,
        data: {
          '/api/product/find?Id=100&page=2': {
            target: 'https://www.foo.com/api/product/find?Id=100&page=2',
          },
        },

        result: {},
      },

      // ---
      {
        requestPage: 0,
        data: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },
        },

        result: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            requestPage: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },
        },
      },

      // ---
      {
        requestPage: 1,
        data: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },
        },

        result: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            requestPage: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },
        },
      },

      // ---
      {
        requestPage: 1,
        data: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },

          '/api/product/find?Id=100&page=2': {
            page: 2,
            target: 'https://www.foo.com/api/product/find?Id=100&page=2',
          },
        },

        result: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            requestPage: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },

          '/api/product/find?Id=100&page=2': {
            page: 2,
            requestPage: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=2',
          },
        },
      },

      // ---
      {
        requestPage: 1,
        data: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },

          '/api/product/find?Id=100&page=2': {
            page: 2,
            target: 'https://www.foo.com/api/product/find?Id=100&page=2',
          },

          '/api/product/find?Id=100&page=3': {
            page: 3,
            target: 'https://www.foo.com/api/product/find?Id=100&page=3',
          },

          '/api/product/find?Id=100&page=4': {
            page: 4,
            target: 'https://www.foo.com/api/product/find?Id=100&page=4',
          },
        },

        result: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            requestPage: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },

          '/api/product/find?Id=100&page=2': {
            page: 2,
            requestPage: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=2',
          },

          '/api/product/find?Id=100&page=3': {
            page: 3,
            requestPage: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=3',
          },
        },
      },

      // ---
      {
        requestPage: 10,
        data: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },

          '/api/product/find?Id=100&page=9': {
            page: 9,
            target: 'https://www.foo.com/api/product/find?Id=100&page=9',
          },

          '/api/product/find?Id=100&page=3': {
            page: 3,
            target: 'https://www.foo.com/api/product/find?Id=100&page=3',
          },

          '/api/product/find?Id=100&page=8': {
            page: 8,
            target: 'https://www.foo.com/api/product/find?Id=100&page=8',
          },
        },

        result: {
          '/api/product/find?Id=100&page=9': {
            page: 9,
            requestPage: 10,
            target: 'https://www.foo.com/api/product/find?Id=100&page=9',
          },
        },
      },

      // ---
      {
        requestPage: 10,
        data: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },

          '/api/product/find?Id=100&page=11': {
            page: 11,
            target: 'https://www.foo.com/api/product/find?Id=100&page=11',
          },

          '/api/product/find?Id=100&page=3': {
            page: 3,
            target: 'https://www.foo.com/api/product/find?Id=100&page=3',
          },

          '/api/product/find?Id=100&page=8': {
            page: 8,
            target: 'https://www.foo.com/api/product/find?Id=100&page=8',
          },
        },

        result: {
          '/api/product/find?Id=100&page=11': {
            page: 11,
            requestPage: 10,
            target: 'https://www.foo.com/api/product/find?Id=100&page=11',
          },
        },
      },

      // ---
      {
        requestPage: 10,
        data: {
          '/api/product/find?Id=100&page=1': {
            page: 1,
            target: 'https://www.foo.com/api/product/find?Id=100&page=1',
          },

          '/api/product/find?Id=100&page=11': {
            page: 11,
            target: 'https://www.foo.com/api/product/find?Id=100&page=11',
          },

          '/api/product/find?Id=100&page=3': {
            page: 3,
            target: 'https://www.foo.com/api/product/find?Id=100&page=3',
          },

          '/api/product/find?Id=100&page=9': {
            page: 9,
            target: 'https://www.foo.com/api/product/find?Id=100&page=9',
          },
        },

        result: {
          '/api/product/find?Id=100&page=9': {
            page: 9,
            requestPage: 10,
            target: 'https://www.foo.com/api/product/find?Id=100&page=9',
          },

          '/api/product/find?Id=100&page=11': {
            page: 11,
            requestPage: 10,
            target: 'https://www.foo.com/api/product/find?Id=100&page=11',
          },
        },
      },
    ].forEach((testSet) => {
      expect(Utils.refreshContext(testSet.requestPage, testSet.data))
        .toStrictEqual(testSet.result)
    })
  })
})
