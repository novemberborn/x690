import { OBJECT_IDENTIFIER } from './constants'

export function decode (type, buffer, offset, length) {
  const components = []

  const end = offset + length
  while (offset < end) {
    let sub = 0
    let octet
    do {
      octet = buffer.readUInt8(offset++)
      sub = (sub << 7) | octet & 0b01111111
    } while ((octet & 0b10000000) === 0b10000000)

    if (type === OBJECT_IDENTIFIER && components.length === 0) {
      components.push((sub / 40) | 0, sub % 40)
    } else {
      components.push(sub)
    }
  }

  return components.join('.')
}
