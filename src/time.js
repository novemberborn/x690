import assert from 'assert'

import { UTC_TIME } from './constants'

function decodeUtcTime (str) {
  assert(/^\d{12}Z$/.test(str), 'UTC_TIME primitives must be formatted like yyMMddHHmmssZ')

  const yy = parseInt(str.slice(0, 2), 10)
  const yyyy = (yy < 70 ? 2000 : 1900) + yy
  const isoString = str.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})Z$/, `${yyyy}-$2-$3T$4:$5:$6Z`)
  return new Date(isoString)
}

function decodeGeneralizedTime (str) {
  assert(/^\d{14}(\.\d{1,3})?Z$/.test(str), 'GENERALIZED_TIME primitives must be formatted like yyyyMMddHHmmssZ, yyyyMMddHHmmss.fZ, yyyyMMddHHmmss.ffZ or yyyyMMddHHmmss.fffZ')
  const isoString = str.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\.\d{1,3})?Z/, '$1-$2-$3T$4:$5:$6$7Z')
  return new Date(isoString)
}

export function decode (type, buffer, offset, length) {
  const str = buffer.toString('utf8', offset, offset + length)

  if (type === UTC_TIME) {
    const date = decodeUtcTime(str)
    assert(!isNaN(date), 'UTC_TIME value is not a valid date')
    return date
  }

  const date = decodeGeneralizedTime(str)
  assert(!isNaN(date), 'GENERALIZED_TIME value is not a valid date')
  return date
}
