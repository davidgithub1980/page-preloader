/**
 * Utils
 * @author David Zaba
 *
 */

export function FingerprintUtils() {

  let fingerprint = ''
  let fingerprintTicks = 0

  /**
   *
   * @param store
   */
  this.update = (store = {}) => {
    let newFingerprint

    if (fingerprint !== (newFingerprint = this.build(store))) {
      fingerprint = newFingerprint
      fingerprintTicks = 0
    } else {
      fingerprintTicks++
    }
  }

  /**
   *
   * @param store
   * @return {*}
   */
  this.build = (store) => {
    return Object.keys(store).join('-')
  }

  /**
   *
   * @return {string}
   */
  this.getCurrent = () => {
    return fingerprint
  }

  /**
   *
   * @return {number}
   */
  this.getTicks = () => {
    return fingerprintTicks
  }
}
