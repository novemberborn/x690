import assert from 'assert'

export function decode (buffer, offset) {
  const octet = buffer.readUInt8(offset)
  assert(octet === 0b0 || octet === 0b11111111, 'Boolean octet must be 0b0 or 0b11111111')
  return octet !== 0b0
}
