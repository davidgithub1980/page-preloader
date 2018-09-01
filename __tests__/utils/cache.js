import { XhrUtils } from '../../src/utils/xhr'
import { CacheUtils } from '../../src/utils/cache'
import { FingerprintUtils } from '../../src/utils/fingeprint'

/**
 * Test Suite
 */
describe('Utils/Url Service', () => {

  const DURATION = 60000

  let xhrUtils;
  let Utils;

  /**
   * before ech IT spec
   */
  beforeEach(() => {
    Utils = new CacheUtils();

    xhrUtils = new XhrUtils()
    xhrUtils.pollRemoteSource = jest.fn()

    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  /**
   * specs
   */
  it('should not poll empty store', () => {
    let postMessage = jest.fn()

    Utils.setStore({})
    Utils.setDebug(false)
    Utils.setExpiration(DURATION)
    Utils.setMessenger(postMessage)
    Utils.setMaxInactivityTicks(10)

    Utils.supervise(null, new FingerprintUtils(), xhrUtils);

    // ecpectations
    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DURATION)

    // advance timer
    jest.runOnlyPendingTimers()

    // ecpectations
    expect(setTimeout).toHaveBeenCalledTimes(2)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DURATION)

    expect(postMessage).not.toHaveBeenCalled()
    expect(xhrUtils.pollRemoteSource).not.toHaveBeenCalled()
  })

  /**
   * specs
   */
  it('should not poll store & shutdown', () => {
    let postMessage = jest.fn()

    const store = {
      1: {
        page: 1,
        loadTime: Date.now()
      },

      2: {
        page: 2,
        loadTime: Date.now()
      }
    }

    Utils.setStore(store)
    Utils.setDebug(false)
    Utils.setExpiration(DURATION)
    Utils.setMessenger(postMessage)
    Utils.setMaxInactivityTicks(10)

    Utils.supervise(null, new FingerprintUtils(), xhrUtils);

    for (let i = 1; i <= 12; i++) {
      // advance timer
      jest.runOnlyPendingTimers()

      // ecpectations
      if (i < 12) {
        expect(setTimeout).toHaveBeenCalledTimes(i + 1)
        expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DURATION)

        expect(postMessage).not.toHaveBeenCalled()
        expect(xhrUtils.pollRemoteSource).not.toHaveBeenCalled()
      } else {
        expect(postMessage).toHaveBeenCalled()
      }
    }
  })

  /**
   * specs
   */
  it('should poll store', () => {
    let postMessage = jest.fn()

    xhrUtils.isRequestReady = jest.fn().mockReturnValue(true)

    Utils.setDebug(false)
    Utils.setExpiration(DURATION)
    Utils.setMessenger(postMessage)
    Utils.setMaxInactivityTicks(2)

    // -----
    // ROUND 1
    // ----- cache time not breached
    // ----- paging remains the same
    let store = {
      1: {
        page: 1,
        loadTime: Date.now()
      },

      2: {
        page: 2,
        loadTime: Date.now()
      }
    }

    Utils.setStore(store)
    Utils.supervise(null, new FingerprintUtils(), xhrUtils);

    // advance timer
    jest.runOnlyPendingTimers()

    // ecpectations
    expect(setTimeout).toHaveBeenCalledTimes(2)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DURATION)

    expect(postMessage).not.toHaveBeenCalled()
    expect(xhrUtils.pollRemoteSource).toHaveBeenCalledTimes(0)

    // -----
    // ROUND 2
    // ----- cache time breached
    // ----- paging remains the same
    store = {
      1: {
        page: 1,
        loadTime: Date.now() - 70000
      },

      2: {
        page: 2,
        loadTime: Date.now() - 70000
      }
    }

    Utils.setStore(store)

    // advance timer
    jest.runOnlyPendingTimers()

    // ecpectations
    expect(setTimeout).toHaveBeenCalledTimes(3)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DURATION)

    expect(postMessage).not.toHaveBeenCalled()
    expect(xhrUtils.pollRemoteSource).toHaveBeenCalledTimes(2)

    // -----
    // ROUND 3
    // ----- cache time not breached
    // ----- paging remains the same
    store = {
      1: {
        page: 1,
        loadTime: Date.now()
      },

      2: {
        page: 2,
        loadTime: Date.now()
      }
    }

    Utils.setStore(store)

    // advance timer
    jest.runOnlyPendingTimers()

    // ecpectations
    expect(setTimeout).toHaveBeenCalledTimes(4)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DURATION)

    expect(postMessage).not.toHaveBeenCalled()
    expect(xhrUtils.pollRemoteSource).toHaveBeenCalledTimes(2)

    // -----
    // ROUND 4
    // ----- cache time breached
    // ----- paging is different, cache would be reset otherwise
    store = {
      1: {
        page: 1,
        loadTime: Date.now() - 70000
      },

      3: {
        page: 3,
        loadTime: Date.now() - 70000
      }
    }

    Utils.setStore(store)

    // advance timer
    jest.runOnlyPendingTimers()

    // ecpectations
    expect(setTimeout).toHaveBeenCalledTimes(5)
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), DURATION)

    expect(postMessage).not.toHaveBeenCalled()
    expect(xhrUtils.pollRemoteSource).toHaveBeenCalledTimes(4)
  })
})
