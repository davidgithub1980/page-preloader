import { XhrUtils } from '../../src/utils/xhr'

/**
 * Test Suite
 */
describe('Utils/XHR Service', () => {

  let Utils;
  let XhrMock;

  /**
   *
   * @param mock
   */
  let defineXhrMock = (mock) => {
    window.XMLHttpRequest = jest.fn().mockImplementation(mock)
  }

  /**
   *
   */
  let setXhrReadyMock = () => {
    XhrMock = jest.fn().mockReturnValue({
      onreadystatechange() {},
      readyState: 4,
      open() {},
      send() {}

    })
  }

  /**
   * before ech IT spec
   */
  beforeEach(() => {
    Utils = new XhrUtils();
  })

  /**
   * specs
   */
  it('triggers off an XHR request', () => {
    [
      {
        target: 'https://foo.com',
        endPoint: '/api/product/find?id=1&page=1',
        page: 1,
        requestPage: 1,
      },
    ].forEach((testSet) => {
      setXhrReadyMock()
      defineXhrMock(XhrMock)

      Utils.pollRemoteSource(testSet.target, testSet.endPoint, testSet.page, testSet.requestPage)

      expect(XhrMock).toHaveBeenCalled()
    })
  })

  /**
   * specs
   */
  it('does not trigger off an XHR request', () => {
    [
      {
        endPoint: '/api/product/find?id=1&page=1',
        page: 1,
        requestPage: 1,
      },

      {
        target: 'https://foo.com',
        page: 1,
        requestPage: 1,
      },

      {
        target: 'https://foo.com',
        endPoint: '/api/product/find?id=1&page=1',
        requestPage: 1,
      },

      {
        target: 'https://foo.com',
        endPoint: '/api/product/find?id=1&page=1',
        page: 1,
      },
    ].forEach((testSet) => {
      setXhrReadyMock()
      defineXhrMock(XhrMock)

      Utils.pollRemoteSource(testSet.target, testSet.endPoint, testSet.page, testSet.requestPage)

      expect(XhrMock).not.toHaveBeenCalled()
    })
  })

  /**
   * specs
   */
  it('verifies whether to cache response or not', () => {
    [
      {
        page: 1,
        loadTime: 0,
        cacheDuration : 0,
        result: true,
      },

      {
        page: 1,
        loadTime: 10,
        cacheDuration : 20,
        result: true,
      },

      {
        page: 1,
        loadTime: Date.now() * 2,
        cacheDuration : 0,
        result: false,
      },

      {
        page: 1,
        loadTime: 0,
        cacheDuration : "foo",
        result: false,
      },

      {
        page: 1,
        loadTime: "foo",
        cacheDuration : 10,
        result: false,
      },
    ].forEach((testSet) => {
      setXhrReadyMock()
      defineXhrMock(XhrMock)

      Utils.pollRemoteSource(
        'https://foo.com',
        '/api/product/find?id=1&page=1',
        testSet.page,
        testSet.page
      )

      expect(Utils.isRequestRecacheable(testSet.page, testSet.loadTime, testSet.cacheDuration))
        .toBe(testSet.result)
    })
  })

  /**
   * specs
   */
  it('should invoke messenger or not', () => {
    [
      {
        // XHR response mock
        xhrMock: jest.fn().mockReturnValue({
          onreadystatechange() {},
          responseText: { foo: 'baz' },
          readyState: 4,
          open() {},
          send() {
            this.onreadystatechange()
          }
        }),

        shouldDispatch: true,
      },

      {
        // XHR response mock
        xhrMock: jest.fn().mockReturnValue({
          onreadystatechange() {},
          responseText: {},
          readyState: 2,
          open() {},
          send() {
            this.onreadystatechange()
          }
        }),

        shouldDispatch: false,
      },

      {
        // XHR response mock
        xhrMock: jest.fn().mockReturnValue({
          onreadystatechange() {},
          readyState: 4,
          open() {},
          send() {
            this.onreadystatechange()
          }
        }),

        shouldDispatch: false,
      },
    ].forEach((testSet) => {
      defineXhrMock(testSet.xhrMock)

      let dispatchMock = jest.fn()
      testSet.shouldDispatch && Utils.setMessenger(dispatchMock)

      Utils.pollRemoteSource('https://foo.com', '/api/product/find?id=1&page=1', 1, 1)

      // expectations
      testSet.shouldDispatch ?
        expect(dispatchMock).toHaveBeenCalled()
        :
        expect(dispatchMock).not.toHaveBeenCalled()
    })
  })
})
