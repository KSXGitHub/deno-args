import {
  MAIN_COMMAND,
  PARSE_FAILURE,
} from '../../../lib/symbols.ts'

import {
  assertEquals,
} from '../../deps.ts'

import {
  dbg,
} from '../../utils.ts'

import {
  Case,
  setup,
  test,
} from './setup.ts'

type OkCase = Case<{
  readonly value: Value
  readonly remainingRawArgs: readonly string[]
}>

interface Value {
  readonly 'early-exit': undefined
  readonly foo: boolean
  readonly bar: boolean
  readonly count: number
  readonly number: number
  readonly integer: bigint
  readonly text: string
  readonly 'partial-integer': bigint
  readonly choice: 123 | 'foo' | 456 | 'bar' | '789'
  readonly collect: readonly string[]
}

const okCases: OkCase[] = [
  {
    title: 'minimal full name',
    input: [
      '--number',
      '123.456',
      '--integer',
      '789',
      '--text',
      'hello',
      '--choice',
      'foo',
    ],
    output: {
      value: {
        'early-exit': undefined,
        foo: false,
        bar: false,
        count: 0,
        number: 123.456,
        integer: 789n,
        text: 'hello',
        'partial-integer': 123n,
        choice: 'foo',
        collect: [],
      },
      remainingRawArgs: [],
    },
  },

  {
    title: 'minimal short name',
    input: [
      '-N',
      '-987.654',
      '--integer',
      '-321',
      '--text',
      'world',
      '--choice',
      'bar',
    ],
    output: {
      value: {
        'early-exit': undefined,
        foo: false,
        bar: false,
        count: 0,
        number: -987.654,
        integer: -321n,
        text: 'world',
        'partial-integer': 123n,
        choice: 'bar',
        collect: [],
      },
      remainingRawArgs: [],
    },
  },

  {
    title: 'some flags with full name',
    input: [
      '--foo',
      '--bar',
      '--count',
      '--count',
      '--count',
      '--number',
      '0',
      '--integer',
      '0',
      '--text',
      '',
      '--choice',
      '123',
      '--collect',
      'a',
      '--collect',
      'b',
      '--collect',
      'c',
    ],
    output: {
      value: {
        'early-exit': undefined,
        foo: true,
        bar: true,
        count: 3,
        number: 0,
        integer: 0n,
        'partial-integer': 123n,
        text: '',
        choice: 123,
        collect: ['a', 'b', 'c'],
      },
      remainingRawArgs: [],
    },
  },

  {
    title: 'some flags with short name',
    input: [
      '-fccccc',
      '--number',
      '0',
      '--integer',
      '0',
      '--text',
      '',
      '--choice',
      '789',
    ],
    output: {
      value: {
        'early-exit': undefined,
        foo: true,
        bar: false,
        count: 5,
        number: 0,
        integer: 0n,
        'partial-integer': 123n,
        text: '',
        choice: '789',
        collect: [],
      },
      remainingRawArgs: [],
    },
  },

  {
    title: 'partial option',
    input: [
      '-N',
      '0',
      '--integer',
      '0',
      '--text',
      '',
      '--partial-integer',
      '42',
      '--choice',
      '456',
    ],
    output: {
      value: {
        'early-exit': undefined,
        foo: false,
        bar: false,
        count: 0,
        integer: 0n,
        'partial-integer': 42n,
        choice: 456,
        number: 0,
        text: '',
        collect: [],
      },
      remainingRawArgs: [],
    },
  },

  {
    title: 'remaining arguments',
    input: [
      'abc',
      'def',
      '-N',
      '0',
      '--collect',
      'abc',
      '--integer',
      '0',
      '--text',
      '',
      'ghi',
      '--choice',
      '123',
      'jkl',
      '--collect',
      'def',
      'mno',
      'pqrs',
    ],
    output: {
      value: {
        'early-exit': undefined,
        foo: false,
        bar: false,
        count: 0,
        integer: 0n,
        'partial-integer': 123n,
        choice: 123,
        number: 0,
        text: '',
        collect: ['abc', 'def'],
      },
      remainingRawArgs: [
        'abc',
        'def',
        'ghi',
        'jkl',
        'mno',
        'pqrs',
      ],
    },
  },

  {
    title: 'after double dash',
    input: [
      '--count',
      '-N',
      '0',
      '--integer',
      '0',
      '--text',
      '',
      '--choice',
      '123',
      '--',
      '--not-a-flag',
      '-abcdef',
      '--count',
    ],
    output: {
      value: {
        'early-exit': undefined,
        foo: false,
        bar: false,
        count: 1,
        integer: 0n,
        'partial-integer': 123n,
        choice: 123,
        number: 0,
        text: '',
        collect: [],
      },
      remainingRawArgs: [
        '--not-a-flag',
        '-abcdef',
        '--count',
      ],
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

type ErrCase = Case<{
  readonly types: readonly string[]
  readonly messages: string
}>

const errCases: ErrCase[] = [
  {
    title: 'missing flags',
    input: [
      '--integer',
      '0',
      '--text',
      '',
      '--choice',
      '123',
    ],
    output: {
      types: ['MissingFlag'],
      messages: 'Flag --number is required but missing',
    },
  },

  {
    title: 'conflict flags',
    input: [
      '--integer',
      '2',
      '--text',
      'hello',
      '--choice',
      'foo',
      '--number',
      '123',
      '-N',
      '321',
    ],
    output: {
      types: ['ConflictFlags'],
      messages: 'Conflicting options: --number -N',
    },
  },

  {
    title: 'unexpected flag',
    input: [
      '--integer',
      '--text',
      'hello',
      '--choice',
      'foo',
      '--number',
      '123',
    ],
    output: {
      types: ['UnexpectedFlag'],
      messages:
        'Option --integer requires a value but received flag --text instead',
    },
  },

  {
    title: 'missing value',
    input: [
      '--integer',
      '321',
      '--text',
      'hello',
      '--choice',
      'foo',
      '--number',
    ],
    output: {
      types: ['MissingValue'],
      messages: 'Option --number requires a value but none was found',
    },
  },
]

errCases.forEach(param =>
  test(param, () => {
    const { input, output } = param
    const result = setup().parse(input)
    if (result.tag !== PARSE_FAILURE) {
      throw dbg`unexpected tag\nResult: ${result}`
    }
    const types = result.error.errors.map(x => x.constructor.name)
    const messages = result.error.toString()
    assertEquals({ types, messages }, output)
  })
)
