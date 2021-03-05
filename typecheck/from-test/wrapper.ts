import { CommandError } from '../../lib/command-errors.ts'
import { MAIN_COMMAND, PARSE_FAILURE } from '../../lib/symbols.ts'
import { ParseError, ArgvItem } from '../../lib/types.ts'
import { setup } from '../../test/wrapper/mixed/setup.ts'
import { assert } from '../deps.ts'

const result = setup().parse([])

switch (result.tag) {
  case PARSE_FAILURE:
    assert<CommandError<readonly ParseError[]>>(result.error)
    assert<null | undefined>(result.value)
    break

  case MAIN_COMMAND:
    assert<ReadonlySet<ArgvItem>>(result.consumedArgs)
    assert<null | undefined>(result.error)
    assert<readonly string[]>(result.remaining().rawArgs())
    assert<readonly string[]>(result.remaining().rawFlags())
    assert<readonly string[]>(result.remaining().rawValues())

    // flag values
    assert<void>(result.value['early-exit'])
    assert<boolean>(result.value.foo)
    assert<boolean>(result.value.bar)
    assert<'foo' | 'bar' | 123 | 456 | '789'>(result.value.choice)
    assert<number>(result.value.count)
    assert<bigint>(result.value.integer)
    assert<number>(result.value.number)
    assert<bigint>(result.value['partial-integer'])
    assert<string>(result.value.text)
    assert<string[]>(result.value.collect)
    assert<string[]>(result.value['drain-until-flag'])
    assert<string[]>(result.value['drain-all'])

    break

  case 'sub0':
    assert<ReadonlySet<ArgvItem>>(result.consumedArgs)
    assert<null | undefined>(result.error)
    assert<readonly string[]>(result.remaining().rawArgs())
    assert<readonly string[]>(result.remaining().rawFlags())
    assert<readonly string[]>(result.remaining().rawValues())

    // flag values
    assert<MAIN_COMMAND>(result.value.tag)
    assert<null | undefined>(result.value.error)
    assert<{}>(result.value.value)
    assert<typeof result['value']['value']>({})

    break

  case 'sub1':
    assert<ReadonlySet<ArgvItem>>(result.consumedArgs)
    assert<null | undefined>(result.error)
    assert<readonly string[]>(result.remaining().rawArgs())
    assert<readonly string[]>(result.remaining().rawFlags())
    assert<readonly string[]>(result.remaining().rawValues())

    // flag values
    assert<MAIN_COMMAND>(result.value.tag)
    assert<null | undefined>(result.value.error)
    assert<boolean>(result.value.value.test)

    break

  case 'sub2':
    assert<ReadonlySet<ArgvItem>>(result.consumedArgs)
    assert<null | undefined>(result.error)
    assert<readonly string[]>(result.remaining().rawArgs())
    assert<readonly string[]>(result.remaining().rawFlags())
    assert<readonly string[]>(result.remaining().rawValues())

    // flag values
    assert<MAIN_COMMAND>(result.value.tag)
    assert<null | undefined>(result.value.error)
    assert<number>(result.value.value.number)
    assert<string>(result.value.value.text)
}
