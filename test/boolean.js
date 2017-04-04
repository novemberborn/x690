import { AssertionError } from 'assert'

import test from 'ava'

import { decode } from '../dist/boolean'

test('0b0 decodes to false', t => {
  t.false(decode(Buffer.from([0b0]), 0))
})

test('0b11111111 decodes to true', t => {
  t.true(decode(Buffer.from([0b11111111]), 0))
})

test('any other value throws an AssertionError', t => {
  for (let i = 1; i < 255; i++) {
    const err = t.throws(() => decode(Buffer.from([i]), 0), AssertionError)
    t.is(err.message, 'Boolean octet must be 0b0 or 0b11111111')
  }
})
