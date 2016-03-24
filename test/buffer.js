import test from 'ava'

import { decode } from '../lib/buffer'

test('returns a buffer with the expected bytes', t => {
  const input = new Buffer('abcdefghij')
  t.is(decode(input, 2, 6).toString(), 'cdefgh')
})

test('returns a slice of the input buffer, not a copy', t => {
  const input = new Buffer('abcdefghij')
  const slice = decode(input, 2, 6)
  input[4] = 83
  t.is(slice[2], 83)
})
