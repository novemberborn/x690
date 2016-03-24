import assert from 'assert'

import {
  BIT_STRING,
  BMP_STRING,
  BOOLEAN,
  CHARACTER_STRING,
  ENUMERATED,
  GENERAL_STRING,
  GENERALIZED_TIME,
  GRAPHIC_STRING,
  IA5_STRING,
  INTEGER,
  NULL,
  NUMERIC_STRING,
  OBJECT_DESCRIPTOR,
  OBJECT_IDENTIFIER,
  OCTET_STRING,
  PRINTABLE_STRING,
  REAL,
  RELATIVE_OID,
  T61_STRING,
  UNIVERSAL_STRING,
  UTC_TIME,
  UTF8_STRING,
  VIDEOTEX_STRING,
  VISIBLE_STRING
} from '../constants'

import { decode as decodeBoolean } from './boolean'
import { decode as decodeBuffer } from './buffer'
import { decode as decodeNumber } from './number'
import { decode as decodeObjectIdentifier } from './object-identifier'
import { decode as decodeString } from './string'
import { decode as decodeTime } from './time'

export function decode (type, buffer, offset, length) {
  assert(Buffer.isBuffer(buffer), 'Parameter `buffer` must be a Buffer')
  assert(typeof offset === 'number' && offset >= 0, 'Parameter `offset` must be >= 0')

  if (type === NULL) {
    assert(length === 0, 'Parameter `length` must be 0 for NULL primitives')
    return null
  }

  if (type === OCTET_STRING) {
    assert(typeof length === 'number' && length >= 0, 'Parameter `length` must be >= 0 for OCTET_STRING primitives')
  } else {
    assert(length > 0, 'Parameter `length` must be >= 1 for non-NULL and non-OCTET_STRING primitives')
  }

  switch (type) {
    case BOOLEAN:
      assert(length === 1, 'Parameter `length` must be 1 for BOOLEAN primitives')
      return decodeBoolean(buffer, offset)

    case BIT_STRING:
    case CHARACTER_STRING:
    case OCTET_STRING:
      return decodeBuffer(buffer, offset, length)

    case ENUMERATED:
    case INTEGER:
    case REAL:
      return decodeNumber(type, buffer, offset, length)

    case OBJECT_IDENTIFIER:
    case RELATIVE_OID:
      return decodeObjectIdentifier(type, buffer, offset, length)

    case BMP_STRING:
    case GENERAL_STRING:
    case GRAPHIC_STRING:
    case IA5_STRING:
    case NUMERIC_STRING:
    case OBJECT_DESCRIPTOR:
    case PRINTABLE_STRING:
    case T61_STRING:
    case UNIVERSAL_STRING:
    case UTF8_STRING:
    case VIDEOTEX_STRING:
    case VISIBLE_STRING:
      return decodeString(type, buffer, offset, length)

    case GENERALIZED_TIME:
    case UTC_TIME:
      return decodeTime(type, buffer, offset, length)

    default:
      throw new TypeError('Unrecognized primitive, universal ASN.1 type')
  }
}
