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
  }
]

const test = (
  args: readonly string[],
  fn: () => void | Promise<void>
) => Deno.test(args.join(' '), fn)

okCases.forEach(({ input, output }) => test(input, () => {
  const result = setup().parse(input)
  if (result.tag !== MAIN_COMMAND) {
    throw dbg`UnexpectedTag\nResult: ${result}`
  }
  const { value } = result
  const remainingRawArgs = result.remaining().rawArgs()
  assertEquals({ value, remainingRawArgs }, output)
}))
