import { MAIN_COMMAND } from '../../../lib/symbols.ts'
import { assertEquals } from '../../deps.ts'
import { dbg } from '../../utils.ts'
import { Case, setup, test } from './setup.ts'

type OkCase = Case<{
  readonly value: Value
  readonly remainingRawArgs: readonly string[]
}>

interface Value {
  readonly 'shared-binary-flag': boolean
  readonly 'shared-count-flag': number
  readonly 'before-merge': boolean
  readonly 'after-merge': boolean
}

const okCases: OkCase[] = [
  {
    title: 'empty',
    input: [],
    output: {
      value: {
        'shared-binary-flag': false,
        'shared-count-flag': 0,
        'before-merge': false,
        'after-merge': false,
      },
      remainingRawArgs: [],
    },
  },

  {
    title: 'just one',
    input: [
      '--shared-binary-flag',
      '--shared-count-flag',
      '--before-merge',
      '--after-merge',
    ],
    output: {
      value: {
        'shared-binary-flag': true,
        'shared-count-flag': 1,
        'before-merge': true,
        'after-merge': true,
      },
      remainingRawArgs: [],
    },
  },

  {
    title: 'with remains',
    input: [
      'abc',
      '--shared-binary-flag',
      'def',
      '--shared-count-flag',
      '--before-merge',
      '--after-merge',
    ],
    output: {
      value: {
        'shared-binary-flag': true,
        'shared-count-flag': 1,
        'before-merge': true,
        'after-merge': true,
      },
      remainingRawArgs: ['abc', 'def'],
    },
  },
]

okCases.forEach(param =>
  test(param, () => {
    const { input, output } = param
    const result = setup().parse(input)
    if (result.tag !== MAIN_COMMAND) {
      throw dbg`unexpected tag\nResult: ${result}`
    }
    const { value } = result
    const remainingRawArgs = result.remaining().rawArgs()
    assertEquals({ value, remainingRawArgs }, output)
  })
)
