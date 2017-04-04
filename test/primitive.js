import { AssertionError } from 'assert'

import test from 'ava'

import {
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
} from '../constants'
import { decode } from '../dist/primitive'

test('throws when decoding an unknown type', t => {
  const err = t.throws(() => decode('foo', Buffer.alloc(0), 0, 1), TypeError)
  t.is(err.message, 'Unrecognized primitive, universal ASN.1 type')
})

test('throws when decoding a non-Buffer', t => {
  const err = t.throws(() => decode(BOOLEAN, {}), AssertionError)
  t.is(err.message, 'Parameter `buffer` must be a Buffer')
})

test('throws when decoding with a non-number offset', t => {
  const err = t.throws(() => decode(BOOLEAN, Buffer.alloc(0), false, 1), AssertionError)
  t.is(err.message, 'Parameter `offset` must be >= 0')
})

test('throws when decoding with a negative offset', t => {
  const err = t.throws(() => decode(BOOLEAN, Buffer.alloc(0), -1, 1), AssertionError)
  t.is(err.message, 'Parameter `offset` must be >= 0')
})

test('throws when decoding with a non-number length', t => {
  const err = t.throws(() => decode(BOOLEAN, Buffer.alloc(0), 0, false), AssertionError)
  t.is(err.message, 'Parameter `length` must be >= 1 for non-NULL and non-OCTET_STRING primitives')
})

test('throws when decoding with a negative length', t => {
  const err = t.throws(() => decode(BOOLEAN, Buffer.alloc(0), 0, -1), AssertionError)
  t.is(err.message, 'Parameter `length` must be >= 1 for non-NULL and non-OCTET_STRING primitives')
})

;[
  ['EMBEDDED_PDV', EMBEDDED_PDV],
  ['EXTERNAL', EXTERNAL],
  ['SEQUENCE', SEQUENCE],
  ['SET', SET]
].forEach(([title, type]) => {
  test(`throws when decoding ${title}`, t => {
    const err = t.throws(() => decode(type, Buffer.alloc(0), 0, 1), TypeError)
    t.is(err.message, 'Unrecognized primitive, universal ASN.1 type')
  })
})

test('starts decoding from the offset', t => {
  t.true(decode(BOOLEAN, Buffer.from([0b0, 0b11111111]), 1, 1))
})

test('decodes NULL', t => {
  t.is(decode(NULL, Buffer.alloc(0), 0, 0), null)
})

test('throws when decoding a NULL with a non-zero length', t => {
  const err = t.throws(() => decode(NULL, Buffer.alloc(0), 0, 1), AssertionError)
  t.is(err.message, 'Parameter `length` must be 0 for NULL primitives')
})

test('decodes BOOLEAN', t => {
  t.false(decode(BOOLEAN, Buffer.from([0b0]), 0, 1))
  t.true(decode(BOOLEAN, Buffer.from([0b11111111]), 0, 1))
})

test('throws when decoding a BOOLEAN longer than 1 byte', t => {
  const err = t.throws(() => decode(BOOLEAN, Buffer.from([0b0, 0b0]), 0, 2), AssertionError)
  t.is(err.message, 'Parameter `length` must be 1 for BOOLEAN primitives')
})

;[
  ['BIT_STRING', BIT_STRING],
  ['CHARACTER_STRING', CHARACTER_STRING],
  ['OCTET_STRING', OCTET_STRING]
].forEach(([title, type]) => {
  test(`decodes ${title}`, t => {
    const expected = Buffer.from('foo')
    t.deepEqual(decode(type, expected, 0, 3), expected)
  })
})

test('throws when decoding an OCTET_STRING with a non-number length', t => {
  const err = t.throws(() => decode(OCTET_STRING, Buffer.alloc(0), 0, false), AssertionError)
  t.is(err.message, 'Parameter `length` must be >= 0 for OCTET_STRING primitives')
})

test('throws when decoding an OCTET_STRING with a negative length', t => {
  const err = t.throws(() => decode(OCTET_STRING, Buffer.alloc(0), 0, -1), AssertionError)
  t.is(err.message, 'Parameter `length` must be >= 0 for OCTET_STRING primitives')
})

;[
  ['ENUMERATED', ENUMERATED],
  ['INTEGER', INTEGER]
].forEach(([title, type]) => {
  test(`decodes ${title}`, t => {
    t.is(decode(type, Buffer.from([42]), 0, 1), 42)
    const expected = Buffer.alloc(7)
    t.deepEqual(decode(type, expected, 0, 7), expected)
  })
})

test('decodes REAL', t => {
  const expected = Buffer.alloc(7)
  t.deepEqual(decode(REAL, expected, 0, 7), expected)
})

test('decodes OBJECT_IDENTIFIER', t => {
  t.is(decode(OBJECT_IDENTIFIER, Buffer.from([0b00101010, 0b11]), 0, 2), '1.2.3')
})

test('decodes RELATIVE_OID', t => {
  t.is(decode(RELATIVE_OID, Buffer.from([0b00101010, 0b11]), 0, 2), '42.3')
})

;[
  ['IA5_STRING', IA5_STRING],
  ['GENERAL_STRING', GENERAL_STRING],
  ['GRAPHIC_STRING', GRAPHIC_STRING],
  ['T61_STRING', T61_STRING],
  ['VIDEOTEX_STRING', VIDEOTEX_STRING],
  ['VISIBLE_STRING', VISIBLE_STRING]
].forEach(([title, type]) => {
  test(`decodes ${title}`, t => {
    t.is(decode(type, Buffer.from('abc'), 0, 3), 'abc')
  })
})

test('decodes BMP_STRING', t => {
  const expected = 'ЖЗИЙ' // two-byte cyrillic characters
  const buffer = Buffer.alloc(8)
  Array.from(expected).forEach((char, index) => {
    buffer.writeUInt16BE(char.codePointAt(0), index * 2)
  })
  t.is(decode(BMP_STRING, buffer, 0, 8), expected)
})

test('decodes NUMERIC_STRING values', t => {
  t.is(decode(NUMERIC_STRING, Buffer.from('11 24'), 0, 5), '11 24')
})

test('decodes PRINTABLE_STRING values', t => {
  t.is(decode(PRINTABLE_STRING, Buffer.from('hello'), 0, 5), 'hello')
})

test('decodes UNIVERSAL_STRING values', t => {
  const expected = '💩💪' // four-byte emoji
  const buffer = Buffer.alloc(8)
  Array.from(expected).forEach((char, index) => {
    buffer.writeUInt32BE(char.codePointAt(0), index * 4)
  })

  t.is(decode(UNIVERSAL_STRING, buffer, 0, 8), expected)
})

test('decodes OBJECT_DESCRIPTOR values', t => {
  t.is(decode(OBJECT_DESCRIPTOR, Buffer.from('aЖ💩'), 0, 7), 'aЖ💩')
})

test('decodes UTF8_STRING values', t => {
  t.is(decode(UTF8_STRING, Buffer.from('aЖ💩'), 0, 7), 'aЖ💩')
})

test('decodes UTC_TIME', t => {
  t.deepEqual(decode(UTC_TIME, Buffer.from('010101000000Z'), 0, 13), new Date('2001-01-01T00:00:00Z'))
})

test('decodes GENERALIZED_TIME', t => {
  t.deepEqual(decode(GENERALIZED_TIME, Buffer.from('20160316182035Z'), 0, 15), new Date('2016-03-16T18:20:35Z'))
})
