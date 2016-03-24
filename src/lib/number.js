import { REAL } from '../constants'

export function decode (type, buffer, offset, length) {
  if (type === REAL || length > 6) {
    return buffer.slice(offset, offset + length)
  }

  return buffer.readIntBE(offset, length)
}
