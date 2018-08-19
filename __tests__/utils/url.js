import { UrlUtils } from '../../src/utils/url'

/**
 * Test Suite
 */
describe('Utils/Url Service', () => {

  let Utils;

  /**
   * before ech IT spec
   */
  beforeEach(() => {
    Utils = new UrlUtils();
  })

  /**
   * specs
   */
  it('succeeds to build request', () => {
    [
      {
        data: {
          origin: 'https://foo.baz',
          apiEndpoint: '/api/product/find?id=1',
        },
      },

      {
        data: {
          origin: 'www.foo.baz',
          apiEndpoint: '/api/product/find/1',
        },
      },
    ].forEach((testSet) => {
      expect(Utils.buildRequest(testSet))
        .toEqual(`${testSet.data.origin}${testSet.data.apiEndpoint}`)
    })
  })

  /**
   * specs
   */
  it('fails to build request', () => {
    [
      {
        data: {
          apiEndpoint: '/api/product/find?id=1',
        },
      },

      {
        data: {
          origin: '',
          apiEndpoint: '/api/product/find/1',
        },
      },

      {
        data: {
          origin: 'https://foo.baz',
        },
      },

      {
        data: {
          origin: 'https://foo.baz',
          apiEndpoint: '',
        },
      },
    ].forEach((testSet) => {
      expect(Utils.buildRequest(testSet))
        .toBeFalsy()
    })
  })

  /**
   * specs
   */
  it('succeeds to build contextualized target', () => {
    [
      {
        url: 'https://foo.baz/api/product/find?id=1&page=1',
        result: 'https://foo.baz/api/product/find?id=1&page=1',
      },

      {
        url: 'https://foo.baz/api/product/find?id=1&page=1',
        page: 2,
        result: 'https://foo.baz/api/product/find?id=1&page=2',
      },

      {
        url: 'https://foo.baz/api/product/find?id=1&page=1&baz=bar',
        page: 3,
        result: 'https://foo.baz/api/product/find?id=1&page=3&baz=bar',
      },

      {
        url: 'https://foo.baz/api/product/find?id=1&page=1&baz=bar',
        page: -5,
        result: 'https://foo.baz/api/product/find?id=1&page=5&baz=bar',
      },
    ].forEach((testSet) => {
      expect(Utils.buildContextualizedTarget(testSet.url, testSet.page))
        .toEqual(testSet.result)
    })
  })

  /**
   * specs
   */
  it('fails to build contextualized target', () => {
    [
      {
      },

      {
        page: 1,
      },

      {
        url: 'https://foo.baz/api/product/find?id=1&page=1',
        page: 0,
      },
    ].forEach((testSet) => {
      expect(Utils.buildContextualizedTarget(testSet.url, testSet.page))
        .toBeFalsy()
    })
  })

  /**
   * specs
   */
  it('succeeds to build contextualized endpoint', () => {
    [
      {
        url: '/api/product/find?id=1&page=1',
        result: '/api/product/find?id=1&page=1',
      },

      {
        url: '/api/product/find?id=1&page=1',
        page: 2,
        result: '/api/product/find?id=1&page=2',
      },

      {
        url: '/api/product/find?id=1&page=1&baz=bar',
        page: 3,
        result: '/api/product/find?id=1&page=3&baz=bar',
      },

      {
        url: '/api/product/find?id=1&page=1&baz=bar',
        page: -5,
        result: '/api/product/find?id=1&page=5&baz=bar',
      },
    ].forEach((testSet) => {
      expect(Utils.buildContextualizedEndpoint(testSet.url, testSet.page))
        .toEqual(testSet.result)
    })
  })

  /**
   * specs
   */
  it('fails to build contextualized endpoint', () => {
    [
      {
      },

      {
        page: 1,
      },

      {
        url: '/api/product/find?id=1&page=1',
        page: 0,
      },
    ].forEach((testSet) => {
      expect(Utils.buildContextualizedEndpoint(testSet.url, testSet.page))
        .toBeFalsy()
    })
  })
})
