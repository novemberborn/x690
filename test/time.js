import { AssertionError } from 'assert'

import test from 'ava'

import { GENERALIZED_TIME, UTC_TIME } from '../constants'
import { decode } from '../lib/time'

test('returns a Date instance', t => {
  t.truthy(decode(UTC_TIME, new Buffer('991231235959Z'), 0, 13) instanceof Date)
})

test('decodes UTC_TIME from the 20th century', t => {
  t.deepEqual(decode(UTC_TIME, new Buffer('991231235959Z'), 0, 13), new Date('1999-12-31T23:59:59Z'))
})

test('decodes UTC_TIME from the 21st century', t => {
  t.deepEqual(decode(UTC_TIME, new Buffer('010101000000Z'), 0, 13), new Date('2001-01-01T00:00:00Z'))
})

test('decodes GENERALIZED_TIME', t => {
  t.deepEqual(decode(GENERALIZED_TIME, new Buffer('20160316182035Z'), 0, 15), new Date('2016-03-16T18:20:35Z'))
})

test('decodes GENERALIZED_TIME with 1 fractional second', t => {
  t.deepEqual(decode(GENERALIZED_TIME, new Buffer('20160316182035.1Z'), 0, 17), new Date('2016-03-16T18:20:35.1Z'))
})

test('decodes GENERALIZED_TIME with 2 fractional seconds', t => {
  t.deepEqual(decode(GENERALIZED_TIME, new Buffer('20160316182035.12Z'), 0, 18), new Date('2016-03-16T18:20:35.12Z'))
})

test('decodes GENERALIZED_TIME with 3 fractional seconds', t => {
  t.deepEqual(decode(GENERALIZED_TIME, new Buffer('20160316182035.123Z'), 0, 19), new Date('2016-03-16T18:20:35.123Z'))
})

test('throws if the value is invalid', async t => {
  let err = t.throws(() => decode(UTC_TIME, new Buffer('991231235959!'), 0, 13), AssertionError)
  t.is(err.message, 'UTC_TIME primitives must be formatted like yyMMddHHmmssZ')

  err = t.throws(() => decode(GENERALIZED_TIME, new Buffer('20160316182035.fooZ'), 0, 19), AssertionError)
  t.is(err.message, 'GENERALIZED_TIME primitives must be formatted like yyyyMMddHHmmssZ, yyyyMMddHHmmss.fZ, yyyyMMddHHmmss.ffZ or yyyyMMddHHmmss.fffZ')

  err = t.throws(() => decode(UTC_TIME, new Buffer('160316252035Z'), 0, 15), AssertionError)
  t.is(err.message, 'UTC_TIME value is not a valid date')

  err = t.throws(() => decode(GENERALIZED_TIME, new Buffer('20160316252035Z'), 0, 15), AssertionError)
  t.is(err.message, 'GENERALIZED_TIME value is not a valid date')
})
