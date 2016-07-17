import { AssertionError } from 'assert'

import test from 'ava'

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
import { decode } from '../dist/string'

const ascii = Array.from({ length: 128 }).map((_, codePoint) => codePoint)

function getIllegalCodePoints (legalChars) {
  const legal = Array.from(legalChars).map(char => char.codePointAt(0))
  return ascii.filter(codePoint => legal.indexOf(codePoint) === -1)
}

test('BMP_STRING requires an even length', t => {
  const err = t.throws(() => decode(BMP_STRING, new Buffer(3), 0, 3), AssertionError)
  t.is(err.message, 'BMP_STRING primitives must be of an even length')
})

test('decodes BMP_STRING values', t => {
  const expected = 'ЖЗИЙ' // two-byte cyrillic characters
  const buffer = new Buffer(8)
  Array.from(expected).forEach((char, index) => {
    buffer.writeUInt16BE(char.codePointAt(0), index * 2)
  })

  t.is(decode(BMP_STRING, buffer, 0, 8), expected)
})

test('decodes IA5_STRING values', t => {
  t.is(decode(IA5_STRING, new Buffer('abc'), 0, 3), 'abc')
})

test('decodes NUMERIC_STRING values', t => {
  t.is(decode(NUMERIC_STRING, new Buffer('11 24'), 0, 5), '11 24')
})

test('throws if NUMERIC_STRING contains illegal characters', t => {
  for (const codePoint of getIllegalCodePoints('0123456789 ')) {
    const err = t.throws(
      () => decode(NUMERIC_STRING, new Buffer([codePoint]), 0, 1),
      AssertionError,
      `Character at code point ${codePoint} ('${String.fromCodePoint(codePoint)}')`)
    t.is(err.message, 'Unexpected character in NUMERIC_STRING value')
  }
})

test('decodes PRINTABLE_STRING values', t => {
  t.is(decode(PRINTABLE_STRING, new Buffer('hello'), 0, 5), 'hello')
})

test('throws if PRINTABLE_STRING contains illegal characters', t => {
  for (const codePoint of getIllegalCodePoints('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 \'()+,-.:=?')) {
    const err = t.throws(
      () => decode(PRINTABLE_STRING, new Buffer([codePoint]), 0, 1),
      AssertionError,
      `Character at code point ${codePoint} ('${String.fromCodePoint(codePoint)}')`)
    t.is(err.message, 'Unexpected character in PRINTABLE_STRING value')
  }
})

test('UNIVERSAL_STRING requires length to be a multiple of 4', t => {
  let err = t.throws(() => decode(UNIVERSAL_STRING, new Buffer(3), 0, 3), AssertionError)
  t.is(err.message, 'UNIVERSAL_STRING primitives must have an even length that is a multiple of 4')
  err = t.throws(() => decode(UNIVERSAL_STRING, new Buffer(5), 0, 5), AssertionError)
  t.is(err.message, 'UNIVERSAL_STRING primitives must have an even length that is a multiple of 4')
})

test('decodes UNIVERSAL_STRING values', t => {
  const expected = '💩💪' // four-byte emoji
  const buffer = new Buffer(8)
  Array.from(expected).forEach((char, index) => {
    buffer.writeUInt32BE(char.codePointAt(0), index * 4)
  })

  t.is(decode(UNIVERSAL_STRING, buffer, 0, 8), expected)
})

test('decodes OBJECT_DESCRIPTOR values', t => {
  t.is(decode(OBJECT_DESCRIPTOR, new Buffer('aЖ💩'), 0, 7), 'aЖ💩')
})

test('decodes UTF8_STRING values', t => {
  t.is(decode(UTF8_STRING, new Buffer('aЖ💩'), 0, 7), 'aЖ💩')
})

test('decodes GENERAL_STRING values', t => {
  t.is(decode(GENERAL_STRING, new Buffer('abc'), 0, 3), 'abc')
})

test('decodes GRAPHIC_STRING values', t => {
  t.is(decode(GRAPHIC_STRING, new Buffer('abc'), 0, 3), 'abc')
})

test('decodes T61_STRING values', t => {
  t.is(decode(T61_STRING, new Buffer('abc'), 0, 3), 'abc')
})

test('decodes VIDEOTEX_STRING values', t => {
  t.is(decode(VIDEOTEX_STRING, new Buffer('abc'), 0, 3), 'abc')
})

test('decodes VISIBLE_STRING values', t => {
  t.is(decode(VISIBLE_STRING, new Buffer('abc'), 0, 3), 'abc')
})
