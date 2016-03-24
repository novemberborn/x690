import assert from 'assert'

import {
  BMP_STRING,
  GENERAL_STRING,
  GRAPHIC_STRING,
  IA5_STRING,
  NUMERIC_STRING,
  OBJECT_DESCRIPTOR,
  PRINTABLE_STRING,
  T61_STRING,
  UNIVERSAL_STRING,
  UTF8_STRING,
  VIDEOTEX_STRING,
  VISIBLE_STRING
} from '../constants'

export function decode (type, buffer, start, length) {
  const end = start + length

  switch (type) {
    case BMP_STRING: {
      assert(length % 2 === 0, 'BMP_STRING primitives must be of an even length')
      const chars = []
      while (start < end) {
        chars.push(String.fromCodePoint(buffer.readUInt16BE(start)))
        start += 2
      }
      return chars.join('')
    }

    case IA5_STRING:
      return buffer.toString('ascii', start, end)

    case NUMERIC_STRING: {
      const str = buffer.toString('ascii', start, end)
      assert(/^[0-9 ]*$/.test(str), 'Unexpected character in NUMERIC_STRING value')
      return str
    }

    case PRINTABLE_STRING: {
      const str = buffer.toString('ascii', start, end)
      assert(/^[A-Za-z0-9 '()+,-.:=?]*$/.test(str), 'Unexpected character in PRINTABLE_STRING value')
      return str
    }

    case UNIVERSAL_STRING: {
      assert(length % 4 === 0, 'UNIVERSAL_STRING primitives must have an even length that is a multiple of 4')
      const chars = []
      while (start < end) {
        chars.push(String.fromCodePoint(buffer.readUInt32BE(start)))
        start += 4
      }
      return chars.join('')
    }

    case OBJECT_DESCRIPTOR: // Describes an object and rarely used. Just treat as UTF8.
    case UTF8_STRING:
      return buffer.toString('utf8', start, end)

    // Treat these legacy encoding as ASCII without applying any validation.
    case GENERAL_STRING:
    case GRAPHIC_STRING:
    case T61_STRING:
    case VIDEOTEX_STRING:
    case VISIBLE_STRING:
      return buffer.toString('ascii', start, end)
  }
}
