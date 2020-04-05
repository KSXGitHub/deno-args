import {
  assertEquals,
  TemplateTag
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
    title: 'minimal alias',
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
  }
]

const test = (
  param: Case<unknown>,
  fn: () => void | Promise<void>
) => Deno.test(`${param.title} (${param.input.join(' ')})`, fn)

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
