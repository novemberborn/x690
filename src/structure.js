import assert from 'assert'

import {
  UNIVERSAL,
  APPLICATION,
  CONTEXT_SPECIFIC,
  PRIVATE,

  BOOLEAN,
  INTEGER,
  BIT_STRING,
  OCTET_STRING,
  NULL,
  OBJECT_IDENTIFIER,
  OBJECT_DESCRIPTOR,
  EXTERNAL,
  REAL,
  ENUMERATED,
  EMBEDDED_PDV,
  UTF8_STRING,
  RELATIVE_OID,
  SEQUENCE,
  SET,
  NUMERIC_STRING,
  PRINTABLE_STRING,
  T61_STRING,
  VIDEOTEX_STRING,
  IA5_STRING,
  UTC_TIME,
  GENERALIZED_TIME,
  GRAPHIC_STRING,
  VISIBLE_STRING,
  GENERAL_STRING,
  UNIVERSAL_STRING,
  CHARACTER_STRING,
  BMP_STRING
} from './constants'

const classLookup = {
  0b00: UNIVERSAL,
  0b01: APPLICATION,
  0b10: CONTEXT_SPECIFIC,
  0b11: PRIVATE
}

const typeLookup = {
  0b00001: BOOLEAN,
  0b00010: INTEGER,
  0b00011: BIT_STRING,
  0b00100: OCTET_STRING,
  0b00101: NULL,
  0b00110: OBJECT_IDENTIFIER,
  0b00111: OBJECT_DESCRIPTOR,
  0b01000: EXTERNAL,
  0b01001: REAL,
  0b01010: ENUMERATED,
  0b01011: EMBEDDED_PDV,
  0b01100: UTF8_STRING,
  0b01101: RELATIVE_OID,
  0b10000: SEQUENCE,
  0b10001: SET,
  0b10010: NUMERIC_STRING,
  0b10011: PRINTABLE_STRING,
  0b10100: T61_STRING,
  0b10101: VIDEOTEX_STRING,
  0b10110: IA5_STRING,
  0b10111: UTC_TIME,
  0b11000: GENERALIZED_TIME,
  0b11001: GRAPHIC_STRING,
  0b11010: VISIBLE_STRING,
  0b11011: GENERAL_STRING,
  0b11100: UNIVERSAL_STRING,
  0b11101: CHARACTER_STRING,
  0b11110: BMP_STRING
}

function decodeTag (buffer, offset) {
  const tag = buffer.readUInt8(offset++)

  const tagClass = classLookup[tag >> 6]
  const primitive = (tag & 0b00100000) === 0

  let tagNumber = tag & 0b00011111
  let type = null
  if (tagClass === UNIVERSAL) {
    type = typeLookup[tagNumber] || null
  } else if (tagNumber === 0b00011111) {
    tagNumber = 0
    let octet
    do {
      octet = buffer.readUInt8(offset++)
      tagNumber = (tagNumber << 7) | octet & 0b01111111
    } while ((octet & 0b10000000) === 0b10000000)
  }

  return [offset, tagClass, tagNumber, type, primitive]
}

function decodeLength (buffer, offset) {
  const octet = buffer.readUInt8(offset++)

  let length = 0
  if ((octet & 0b10000000) === 0) {
    length = octet
  } else {
    for (let remaining = octet & 0b01111111; remaining > 0; remaining--) {
      length = (length << 8) | buffer.readUInt8(offset++)
    }
  }

  return [offset, length]
}

export function decode (buffer, offset) {
  assert(Buffer.isBuffer(buffer), 'Parameter `buffer` must be a Buffer')
  assert(typeof offset === 'number' && offset >= 0, 'Parameter `offset` must be >= 0')

  const [lengthOffset, tagClass, tagNumber, type, primitive] = decodeTag(buffer, offset)
  const [start, length] = decodeLength(buffer, lengthOffset)

  return {
    start,
    end: start + length,
    length,
    primitive,
    tagClass,
    tagNumber,
    type
  }
}
