import test from 'ava'

import { decode } from '../dist/buffer'

test('returns a buffer with the expected bytes', t => {
  const input = Buffer.from('abcdefghij')
  t.is(decode(input, 2, 6).toString(), 'cdefgh')
})

test('returns a slice of the input buffer, not a copy', t => {
  const input = Buffer.from('abcdefghij')
  const slice = decode(input, 2, 6)
  input[4] = 83
  t.is(slice[2], 83)
})
