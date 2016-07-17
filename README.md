# x690

Low-level decoder for X.690 Distinguished Encoding Rules (DER). Tested with
Node.js v6 and above.

Wikipedia has a [decent explanation of
DER](https://en.wikipedia.org/wiki/X.690#DER_encoding). See also the [full spec
(PDF)](https://www.itu.int/rec/dologin_pub.asp?lang=e&id=T-REC-X.690-201508-I!!PDF-E&type=items).

## Installation

```console
$ npm install --save x690
```

## Usage

```js
const x690 = require('x690')

const struct = x690.decodeStructure(someBuffer, 0)
if (struct.tagClass === x690.constants.UNIVERSAL && struct.primitive) {
  const value = x690.decodePrimitive(struct.type, someBuffer, struct.start, struct.length)
}
```

### `decodeStructure(buffer, offset)`

Decodes an ASN.1 structure from `buffer`, starting at the given `offset`.
Returns an object with the following properties:

* `start`: offset within `buffer` at which the structure's value starts
* `end`: offset within `buffer` at which the structure's value ends
* `length`: length of the structure's value (in bytes)
* `primitive`: `true` if the structure contains a primitive value, `false`
otherwise
* `tagClass`: one of the `UNIVERSAL`, `APPLICATION`, `CONTEXT_SPECIFIC` or
`PRIVATE` [constants](#constants)
* `tagNumber`: the tag number
* `type`: if the `tagClass` is `UNIVERSAL` this will be one of the ASN.1 types
(see [constants](#constants)), `null` otherwise

Note that `decodeStructure()` can be called with a partial `buffer`, provided
the tag and length information is available. A `RangeError` is thrown if
insufficient bytes are available.

### `decodePrimitive(type, buffer, offset, length)`

Decodes a universal ASN.1 primitive value from `buffer`, starting at the given
`offset` and with the given `length`. The value is determined by the `type`.

`length` may be `0` for the `NULL` and `OCTET_STRING` types, though it must
still be provided. It must be `1` for the `BOOLEAN` type. It must be at least
`1` for all other types.

An `AssertionError` or `TypeError` may be thrown if the value cannot be decoded.
A `RangeError` is thrown if insufficient bytes are available.

The return values depend on the type:

Type|Minimum length|Maximum length|Return value
---|---|---|---
`BIT_STRING`|`1`|∞|`Buffer`
`BMP_STRING`|`1`|∞|`String`
`BOOLEAN`|`1`|`1`|`Boolean`
`CHARACTER_STRING`|`1`|∞|`Buffer`
`ENUMERATED`|`1`|`6`|`Number`
`ENUMERATED`|`7`|∞|`Buffer`
`GENERAL_STRING`|`1`|∞|`String`
`GENERALIZED_TIME`|`15`|`19`|`Date`
`GRAPHIC_STRING`|`1`|∞|`String`
`IA5_STRING`|`1`|∞|`String`
`INTEGER`|`1`|`6`|`Number`
`INTEGER`|`7`|∞|`Buffer`
`NUMERIC_STRING`|`1`|∞|`String`
`OBJECT_DESCRIPTOR`|`1`|∞|`String`
`OBJECT_IDENTIFIER`|`1`|∞|`String`
`OCTET_STRING`|`0`|∞|`Buffer`
`PRINTABLE_STRING`|`1`|∞|`String`
`REAL`|`1`|∞|`Buffer`
`RELATIVE_OID`|`1`|∞|`String`
`T61_STRING`|`1`|∞|`String`
`UNIVERSAL_STRING`|`1`|∞|`String`
`UTC_TIME`|`13`|`13`|`Date`
`UTF8_STRING`|`1`|∞|`String`
`VIDEOTEX_STRING`|`1`|∞|`String`
`VISIBLE_STRING`|`1`|∞|`String`

### `constants`

Tag classes and types are symbols. You can get a reference to these symbols
through `require('x690').constants` and `require('x690/constants')`.

#### Class symbols

* `UNIVERSAL`
* `APPLICATION`
* `CONTEXT_SPECIFIC`
* `PRIVATE`

#### Type symbols

* `BOOLEAN`
* `INTEGER`
* `BIT_STRING`
* `OCTET_STRING`
* `NULL`
* `OBJECT_IDENTIFIER`
* `OBJECT_DESCRIPTOR`
* `EXTERNAL`
* `REAL`
* `ENUMERATED`
* `EMBEDDED_PDV`
* `UTF8_STRING`
* `RELATIVE_OID`
* `SEQUENCE`
* `SET`
* `NUMERIC_STRING`
* `PRINTABLE_STRING`
* `T61_STRING`
* `VIDEOTEX_STRING`
* `IA5_STRING`
* `UTC_TIME`
* `GENERALIZED_TIME`
* `GRAPHIC_STRING`
* `VISIBLE_STRING`
* `GENERAL_STRING`
* `UNIVERSAL_STRING`
* `CHARACTER_STRING`
* `BMP_STRING`

## Caveats

### Validation

Currently this module only decodes DER data. It does a reasonable job of
validating primitive values but the validation does not fully confirm to the
X.690 specification. Figuring out how to validate the values can be tricky.

*Validation may be improved in the future, even in patch releases. You should
not assume that if you can parse a DER structure without errors that it is
strictly valid.*

#### Known exceptions

* Fractional-second elements in `GENERALIZED_TIME` values are not checked for
trailing zeros.

* Other elements in `GENERALIZED_TIME` and `UTC_TIME` values, like the month,
are only validated to be digits. The time is converted to an ISO 8601 structure
and then parsed into a `Date`. This means `x690` largely depends on the
Date-parsing logic in the JavaScript engine.

* `GENERAL_STRING`, `GRAPHIC_STRING`, `T61_STRING`, `VIDEOTEX_STRING` and
`VISIBLE_STRING` values are treated as ASCII.

*Note that this is likely not an exhaustive list.* Please contribute any other
exception you might come across.

### Constructed values

This module only decodes primitive values. Other ASN.1 types, such as `SEQUENCE`
and `SET` are constructed. There are rules around what constitutes a valid
sequence and how its values must be sorted. This module does not concern itself
with those rules.

Note that if you encounter such a type you can `decodeStructure()` to
recursively decode each value.

### Number representation

Node.js can only decode two's complement signed values up to 6 bytes in length.
Any `ENUMERATED` or `INTEGER` value that is larger than 6 bytes will be decoded
as a buffer. Your code should handle `decodePrimitive()` returning numbers and
buffers.

Currently `REAL` values are not decoded, a buffer is returned instead. If
decoding support is added in the future this will be a breaking change.

### Buffers

Returned buffers are slices of the original input, not copies.
