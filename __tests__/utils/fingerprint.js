import { FingerprintUtils } from '../../src/utils/fingeprint'

/**
 * Test Suite
 */
describe('Utils/Fingerprint Service', () => {

  let Utils;

  /**
   * before ech IT spec
   */
  beforeEach(() => {
    Utils = new FingerprintUtils();
  })

  /**
   * specs
   */
  it('updates fingerprint-related data', () => {
    [
      {
        fingerprint: '',
        ticks: 1,
      },

      {
        store: true,
        fingerprint: '',
        ticks: 2,
      },

      {
        store: {
          '/api/product/find?id=100&page=1': {},
        },

        fingerprint: '/api/product/find?id=100&page=1',
        ticks: 0,
      },

      {
        store: {
          '/api/product/find?id=100&page=1': {},
          '/api/product/find?id=100&page=3': {},
        },

        fingerprint: '/api/product/find?id=100&page=1-/api/product/find?id=100&page=3',
        ticks: 0,
      },

      {
        store: {
          '/api/product/find?id=100&page=1': {},
          '/api/product/find?id=100&page=3': {},
        },

        fingerprint: '/api/product/find?id=100&page=1-/api/product/find?id=100&page=3',
        ticks: 1,
      },

      {
        store: {
          '/api/product/find?id=100&page=1': {},
          '/api/product/find?id=100&page=3': {},
        },

        fingerprint: '/api/product/find?id=100&page=1-/api/product/find?id=100&page=3',
        ticks: 2,
      },

      {
        store: {
          '/api/product/find?id=100&page=2': {},
          '/api/product/find?id=100&page=3': {},
        },

        fingerprint: '/api/product/find?id=100&page=2-/api/product/find?id=100&page=3',
        ticks: 0,
      },
    ].forEach((testSet) => {
      Utils.update(testSet.store)

      expect(Utils.getCurrent()).toEqual(testSet.fingerprint)
      expect(Utils.getTicks()).toEqual(testSet.ticks)
    })
  })
})
