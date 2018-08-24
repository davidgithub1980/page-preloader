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
        // 'target' missing
        endPoint: '/api/product/find?id=1&page=1',
        page: 1,
        requestPage: 1,
      },

      {
        target: 'https://foo.com',
        // 'endPoint' missing
        page: 1,
        requestPage: 1,
      },

      {
        target: 'https://foo.com',
        endPoint: '/api/product/find?id=1&page=1',
        // 'page' missing
        requestPage: 1,
      },

      {
        target: 'https://foo.com',
        endPoint: '/api/product/find?id=1&page=1',
        page: 1,
        // 'requestPage' missing
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

      let responseMock = jest.fn()
      Utils.buildResponse = responseMock

      Utils.pollRemoteSource('https://foo.com', '/api/product/find?id=1&page=1', 1, 1)

      // expectations
      if (testSet.shouldDispatch) {
        expect(dispatchMock).toHaveBeenCalled()
        expect(responseMock).toHaveBeenCalled()
      } else {
        expect(dispatchMock).not.toHaveBeenCalled()
        expect(responseMock).not.toHaveBeenCalled()
      }
    })
  })

  /**
   * specs
   */
  it('should build proper response', () => {
    [
      // ---
      {
        dataIn: {
          page: 1,
          requestPage: 2,
          target: 'https://www.foo.baz',
          endPoint: '/api/product/id?page=1',
          data: "{\"foo\"\"baz\"}", // invalid JSON
        },

        preloadKey: {
          invoke: false
        },

        dataOut: {},
      },

      // ---
      {
        dataIn: {
          page: 1,
          requestPage: 2,
          target: 'https://www.foo.baz',
          endPoint: '/api/product/id?page=1',
          data: "{\"foo\":\"baz\"}",
        },

        preloadKey: {
          invoke: false
        },

        dataOut: {
          id: '/api/product/id?page=1',
          page: 1,
          requestPage: 2,
          target: 'https://www.foo.baz',
          endPoint: '/api/product/id?page=1',
          data: {foo: 'baz'},
          loadTime: 1,
        },
      },

      // ---
      {
        dataIn: {
          page: 1,
          requestPage: 2,
          target: 'https://www.foo.baz',
          endPoint: '/api/product/id?page=1',
          data: "{\"foo\":\"baz\"}",
        },

        preloadKey: {
          invoke: true,
          val: 'foo',
        },

        dataOut: {
          id: '/api/product/id?page=1',
          page: 1,
          requestPage: 2,
          target: 'https://www.foo.baz',
          endPoint: '/api/product/id?page=1',
          data: {foo: 'baz'},
          loadTime: 1,
        },
      },

      // ---
      {
        dataIn: {
          page: 1,
          requestPage: 2,
          target: 'https://www.foo.baz',
          endPoint: '/api/product/id?page=1',
          data: "{\"foo\":\"baz\"}",
        },

        preloadKey: {
          invoke: true,
          val: 'page',
        },

        dataOut: {
          id: 1,
          page: 1,
          requestPage: 2,
          target: 'https://www.foo.baz',
          endPoint: '/api/product/id?page=1',
          data: {foo: 'baz'},
          loadTime: 1,
        },
      },
    ].forEach((testSet) => {
      testSet.preloadKey.invoke && Utils.setPreloadKey(testSet.preloadKey.val)

      Date.now = jest.fn().mockReturnValueOnce(1)

      // expectations
      expect(Utils.buildResponse(
        testSet.dataIn.page,
        testSet.dataIn.requestPage,
        testSet.dataIn.target,
        testSet.dataIn.endPoint,
        testSet.dataIn.data,
      )).toEqual(testSet.dataOut)
    })
  })
})
