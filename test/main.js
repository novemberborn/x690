import test from 'ava'

import {
  constants,
  decodeStructure,
  decodePrimitive
} from '../'

import * as _constants from '../constants'
import { decode as _decodeStructure } from '../lib/structure'
import { decode as _decodePrimitive } from '../lib/primitive'

test('exports all constants', t => {
  t.deepEqual(constants, _constants)
})

test('exports decodeStructure function', t => {
  t.is(typeof decodeStructure, 'function')
  t.is(decodeStructure, _decodeStructure)
})

test('exports decodePrimitive function', t => {
  t.is(typeof decodePrimitive, 'function')
  t.is(decodePrimitive, _decodePrimitive)
})
