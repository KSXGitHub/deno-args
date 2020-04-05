import {
  assertEquals,
  shEsc
} from '../../deps.ts'

import {
  dbg
} from '../../utils.ts'

import { MAIN_COMMAND } from '../../../lib/symbols.ts'

import setup from './setup.ts'

interface Case<Output> {
  readonly title: string
  readonly input: readonly string[]
  readonly output: Output
}

type OkCase = Case<{
  readonly value: Value
  readonly remainingRawArgs: readonly string[]
}>

const escape = (argv: readonly string[]) => argv
  .map(item => item.trim() ? shEsc.singleArgument(item) : "'" + item + "'")
  .join(' ')

const test = (
  param: Case<unknown>,
  fn: () => void | Promise<void>
) => Deno.test(`${param.title} (${escape(param.input)})`, fn)

interface Value {
  readonly foo: boolean
  readonly bar: boolean
  readonly count: number
  readonly number: number
  readonly integer: bigint
  readonly text: string
  readonly 'partial-integer': bigint
  readonly choice: 123 | 'foo' | 456 | 'bar' | '789'
}

const okCases: OkCase[] = [
  {
    title: 'minimal full name',
    input: [
      '--number', '123.456',
      '--integer', '789',
      '--text', 'hello',
      '--choice', 'foo'
    ],
    output: {
      value: {
        foo: false,
        bar: false,
        count: 0,
        number: 123.456,
        integer: 789n,
        text: 'hello',
        'partial-integer': 123n,
        choice: 'foo'
      },
      remainingRawArgs: []
    }
  },

  {
    title: 'minimal short name',
    input: [
      '-N', '-987.654',
      '--integer', '-321',
      '--text', 'world',
      '--choice', 'bar'
    ],
    output: {
      value: {
        foo: false,
        bar: false,
        count: 0,
        number: -987.654,
        integer: -321n,
        text: 'world',
        'partial-integer': 123n,
        choice: 'bar'
      },
      remainingRawArgs: []
    }
  },

  {
    title: 'some flags with full name',
    input: [
      '--foo',
      '--bar',
      '--count', '--count', '--count',
      '--number', '0',
      '--integer', '0',
      '--text', '',
      '--choice', '123'
    ],
    output: {
      value: {
        foo: true,
        bar: true,
        count: 3,
        number: 0,
        integer: 0n,
        'partial-integer': 123n,
        text: '',
        choice: 123
      },
      remainingRawArgs: []
    }
  },

  {
    title: 'some flags with short name',
    input: [
      '-fccccc',
      '--number', '0',
      '--integer', '0',
      '--text', '',
      '--choice', '789'
    ],
    output: {
      value: {
        foo: true,
        bar: false,
        count: 5,
        number: 0,
        integer: 0n,
        'partial-integer': 123n,
        text: '',
        choice: '789'
      },
      remainingRawArgs: []
    }
  },

  {
    title: 'partial option',
    input: [
      '-N', '0',
      '--integer', '0',
      '--text', '',
      '--partial-integer', '42',
      '--choice', '456'
    ],
    output: {
      value: {
        foo: false,
        bar: false,
        count: 0,
        integer: 0n,
        'partial-integer': 42n,
        choice: 456,
        number: 0,
        text: ''
      },
      remainingRawArgs: []
    }
  },

  {
    title: 'remaining arguments',
    input: [
      'abc', 'def',
      '-N', '0',
      '--integer', '0',
      '--text', '',
      'ghi',
      '--choice', '123',
      'jkl', 'mno', 'pqrs'
    ],
    output: {
      value: {
        foo: false,
        bar: false,
        count: 0,
        integer: 0n,
        'partial-integer': 123n,
        choice: 123,
        number: 0,
        text: ''
      },
      remainingRawArgs: [
        'abc', 'def',
        'ghi',
        'jkl', 'mno', 'pqrs'
      ]
    }
  },

  {
    title: 'after double dash',
    input: [
      '--count',
      '-N', '0',
      '--integer', '0',
      '--text', '',
      '--choice', '123',
      '--',
      '--not-a-flag',
      '-abcdef',
      '--count'
    ],
    output: {
      value: {
        foo: false,
        bar: false,
        count: 1,
        integer: 0n,
        'partial-integer': 123n,
        choice: 123,
        number: 0,
        text: ''
      },
      remainingRawArgs: [
        '--not-a-flag',
        '-abcdef',
        '--count'
      ]
    }
  }
]

okCases.forEach(param => test(param, () => {
  const { input, output } = param
  const result = setup().parse(input)
  if (result.tag !== MAIN_COMMAND) {
    throw dbg`UnexpectedTag\nResult: ${result}`
  }
  const { value } = result
  const remainingRawArgs = result.remaining().rawArgs()
  assertEquals({ value, remainingRawArgs }, output)
}))
