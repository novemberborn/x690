import { AssertionError } from 'assert'

import test from 'ava'

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
} from '../constants'
import { decode } from '../dist/structure'

[
  [0b00000000, 'UNIVERSAL', UNIVERSAL],
  [0b01000000, 'APPLICATION', APPLICATION],
  [0b10000000, 'CONTEXT_SPECIFIC', CONTEXT_SPECIFIC],
  [0b11000000, 'PRIVATE', PRIVATE]
].forEach(([tag, title, symbol]) => {
  test(`decodes ${title} class`, t => {
    t.is(decode(Buffer.from([tag, 0b0]), 0).tagClass, symbol)
  })
})

;[
  [0b00001, 'BOOLEAN', BOOLEAN],
  [0b00010, 'INTEGER', INTEGER],
  [0b00011, 'BIT_STRING', BIT_STRING],
  [0b00100, 'OCTET_STRING', OCTET_STRING],
  [0b00101, 'NULL', NULL],
  [0b00110, 'OBJECT_IDENTIFIER', OBJECT_IDENTIFIER],
  [0b00111, 'OBJECT_DESCRIPTOR', OBJECT_DESCRIPTOR],
  [0b01000, 'EXTERNAL', EXTERNAL],
  [0b01001, 'REAL', REAL],
  [0b01010, 'ENUMERATED', ENUMERATED],
  [0b01011, 'EMBEDDED_PDV', EMBEDDED_PDV],
  [0b01100, 'UTF8_STRING', UTF8_STRING],
  [0b01101, 'RELATIVE_OID', RELATIVE_OID],
  [0b10000, 'SEQUENCE', SEQUENCE],
  [0b10001, 'SET', SET],
  [0b10010, 'NUMERIC_STRING', NUMERIC_STRING],
  [0b10011, 'PRINTABLE_STRING', PRINTABLE_STRING],
  [0b10100, 'T61_STRING', T61_STRING],
  [0b10101, 'VIDEOTEX_STRING', VIDEOTEX_STRING],
  [0b10110, 'IA5_STRING', IA5_STRING],
  [0b10111, 'UTC_TIME', UTC_TIME],
  [0b11000, 'GENERALIZED_TIME', GENERALIZED_TIME],
  [0b11001, 'GRAPHIC_STRING', GRAPHIC_STRING],
  [0b11010, 'VISIBLE_STRING', VISIBLE_STRING],
  [0b11011, 'GENERAL_STRING', GENERAL_STRING],
  [0b11100, 'UNIVERSAL_STRING', UNIVERSAL_STRING],
  [0b11101, 'CHARACTER_STRING', CHARACTER_STRING],
  [0b11110, 'BMP_STRING', BMP_STRING]
].forEach(([tag, title, symbol]) => {
  test(`decodes ${title} type`, t => {
    t.is(decode(Buffer.from([tag, 0b0]), 0).type, symbol)
  })
})

test('does not decode reserved or unused UNIVERSAL types', t => {
  t.is(decode(Buffer.from([0b00000000, 0b0]), 0).type, null)
  t.is(decode(Buffer.from([0b00001110, 0b0]), 0).type, null)
  t.is(decode(Buffer.from([0b00001111, 0b0]), 0).type, null)
  t.is(decode(Buffer.from([0b00011111, 0b0]), 0).type, null)
})

;[
  [0b01000000, 'APPLICATION', APPLICATION],
  [0b10000000, 'CONTEXT_SPECIFIC', CONTEXT_SPECIFIC],
  [0b11000000, 'PRIVATE', PRIVATE]
].forEach(([tag, title, symbol]) => {
  test(`does not decode type for ${title} class`, t => {
    t.is(decode(Buffer.from([tag, 0b0]), 0).type, null)
  })
})

;[
  [0b00010111, 'UNIVERSAL', UNIVERSAL],
  [0b01010111, 'APPLICATION', APPLICATION],
  [0b10010111, 'CONTEXT_SPECIFIC', CONTEXT_SPECIFIC],
  [0b11010111, 'PRIVATE', PRIVATE]
].forEach(([tag, title, symbol]) => {
  test(`returns short form tag number for ${title} class`, t => {
    t.is(decode(Buffer.from([tag, 0b0]), 0).tagNumber, 23)
  })
})

;[
  [[0b01011111, 0b10000001, 0b00000001], 'APPLICATION', APPLICATION],
  [[0b10011111, 0b10000001, 0b00000001], 'CONTEXT_SPECIFIC', CONTEXT_SPECIFIC],
  [[0b11011111, 0b10000001, 0b00000001], 'PRIVATE', PRIVATE]
].forEach(([tag, title, symbol]) => {
  test(`returns long form tag number for ${title} class`, t => {
    t.is(decode(Buffer.from([...tag, 0b0]), 0).tagNumber, 129)
  })
})

test('decodes the primitive field', t => {
  t.true(decode(Buffer.from([0b00000001, 0b0]), 0).primitive)
  t.false(decode(Buffer.from([0b00100001, 0b0]), 0).primitive)
})

test('decodes a short form length', t => {
  t.is(decode(Buffer.from([0b0, 0b1]), 0).length, 1)
})

test('decodes a long form length', t => {
  t.is(decode(Buffer.from([0b0, 0b10000011, 0b1, 0b1, 0b1]), 0).length, 65793)
})

test('throws when decoding a non-Buffer', t => {
  const err = t.throws(() => decode({}), AssertionError)
  t.is(err.message, 'Parameter `buffer` must be a Buffer')
})

test('throws when decoding with a non-number offset', t => {
  const err = t.throws(() => decode(Buffer.alloc(0), false), AssertionError)
  t.is(err.message, 'Parameter `offset` must be >= 0')
})

test('throws when decoding with a negative offset', t => {
  const err = t.throws(() => decode(Buffer.alloc(0), -1), AssertionError)
  t.is(err.message, 'Parameter `offset` must be >= 0')
})

test('returns the offset where the value starts', t => {
  t.is(decode(Buffer.from([0b0, 0b1]), 0).start, 2)
})

test('returns the offset where the value ends', t => {
  t.is(decode(Buffer.from([0b0, 0b11]), 0).end, 5)
})

test('starts decoding from the offset', t => {
  t.is(decode(Buffer.from([0b1, 0b0, 0b10, 0b0]), 2).type, INTEGER)
})
