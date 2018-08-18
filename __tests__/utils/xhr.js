import { XhrUtils } from '../../src/utils/xhr'

/**
 * Test Suite
 */
describe('Utils/XHR Service', () => {

  let Utils;
  let XhrMock;

  /**
   * before ech IT spec
   */
  beforeEach(() => {
    Utils = new XhrUtils();

    XhrMock = jest.spyOn(Utils, 'getRequest')

    XhrMock.mockReturnValue({
      onreadystatechange() {},
      open() {},
      send() {}
    })
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
      Utils.pollRemoteSource(testSet.target, testSet.endPoint, testSet.page, testSet.requestPage)

      expect(XhrMock).not.toHaveBeenCalled()
    })
  })
})
