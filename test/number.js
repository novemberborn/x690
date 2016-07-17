import test from 'ava'

import { ENUMERATED, INTEGER, REAL } from '../constants'
import { decode } from '../dist/number'

test('returns a buffer for REAL values', t => {
  t.is(decode(REAL, new Buffer('abcdefghij'), 2, 6).toString(), 'cdefgh')
})

test('returns a buffer for ENUMERATED values if the length is greater than 48 bits', t => {
  t.is(decode(ENUMERATED, new Buffer('abcdefghij'), 2, 7).toString(), 'cdefghi')
})

test('returns a buffer for INTEGER values if the length is greater than 48 bits', t => {
  t.is(decode(INTEGER, new Buffer('abcdefghij'), 2, 7).toString(), 'cdefghi')
})

test('returns a slice of the input buffer, not a copy', t => {
  const input = new Buffer('abcdefghij')
  const real = decode(REAL, input, 2, 6)
  const enumerated = decode(ENUMERATED, input, 2, 7)
  const integer = decode(INTEGER, input, 2, 7)

  input[4] = 83
  t.is(real[2], 83)
  t.is(enumerated[2], 83)
  t.is(integer[2], 83)
})

test('returns an integer for ENUMERATED values if the length is up to 48 bits', t => {
  t.is(decode(ENUMERATED, new Buffer([1, 0, 0, 0, 1]), 0, 5), 4294967297)
})

test('returns an integer for INTEGER values if the length is up to 48 bits', t => {
  t.is(decode(INTEGER, new Buffer([1, 0, 0, 0, 1]), 0, 5), 4294967297)
})
