import { BinaryFlag, Option } from '../lib/flag-types.ts'
import { MAIN_COMMAND } from '../lib/symbols.ts'
import { Integer } from '../lib/value-types.ts'
import args from '../lib/wrapper.ts'
import { assert } from './deps.ts'

const shared = args
  .with(BinaryFlag('shared-binary-flag'))
  .with(Option('shared-option', { type: Integer }))

const foo = args
  .with(BinaryFlag('foo-binary-flag'))
  .with(Option('foo-option', { type: Integer }))

const fooAndShared = foo.merge(shared).parse([])
if (fooAndShared.tag === MAIN_COMMAND) {
  assert<boolean>(fooAndShared.value['shared-binary-flag'])
  assert<bigint>(fooAndShared.value['shared-option'])
  assert<boolean>(fooAndShared.value['foo-binary-flag'])
  assert<bigint>(fooAndShared.value['foo-option'])
}
