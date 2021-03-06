import test from 'ava'

import { OBJECT_IDENTIFIER, RELATIVE_OID } from '../constants'
import { decode } from '../dist/object-identifier'

const absoluteOids = {
  '1.2': [0b00101010],
  '1.2.3': [0b00101010, 0b11],
  '1.2.16513': [0b00101010, 0b10000001, 0b10000001, 0b1]
}

for (const oid in absoluteOids) {
  const octets = absoluteOids[oid]
  test(`correctly decodes ${oid}`, t => {
    t.is(decode(OBJECT_IDENTIFIER, Buffer.from(octets), 0, octets.length), oid)
  })
}

const relativeOids = {
  '42': [0b00101010],
  '42.3': [0b00101010, 0b11],
  '42.16513': [0b00101010, 0b10000001, 0b10000001, 0b1],
  '16513': [0b10000001, 0b10000001, 0b1]
}

for (const oid in relativeOids) {
  const octets = relativeOids[oid]
  test(`correctly decodes relative ${oid}`, t => {
    t.is(decode(RELATIVE_OID, Buffer.from(octets), 0, octets.length), oid)
  })
}
