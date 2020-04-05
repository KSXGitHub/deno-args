import {
  assertEquals
} from '../../deps.ts'

import {
  dbg
} from '../../utils.ts'

import {
  Case,
  setup,
  test
} from './setup.ts'

interface Variant<Tag, Value> {
  readonly tag: Tag
  readonly value: Value
}

type OkCase = Case<
  Variant<'sub0', {}> |
  Variant<'sub1', {
    readonly test: boolean
  }> |
  Variant<'sub2', {
    readonly number: number
    readonly text: string
  }>
>

const okCases: OkCase[] = [
  {
    title: 'sub0',
    input: ['sub0'],
    output: {
      tag: 'sub0',
      value: {}
    }
  },

  {
    title: 'sub1 without flag',
    input: ['sub1'],
    output: {
      tag: 'sub1',
      value: {
        test: false
      }
    }
  },

  {
    title: 'sub1 with flag',
    input: ['sub1', '--test'],
    output: {
      tag: 'sub1',
      value: {
        test: true
      }
    }
  },

  {
    title: 'sub2',
    input: [
      'sub2',
      '--number', '123',
      '--text', 'hello'
    ],
    output: {
      tag: 'sub2',
      value: {
        number: 123,
        text: 'hello'
      }
    }
  }
]

okCases.forEach(param => test(param, () => {
  const { input, output } = param
  const result = setup().parse(input)
  if (result.tag !== 'sub0' && result.tag !== 'sub1' && result.tag !== 'sub2') {
    throw dbg`UnexpectedTag\nResult:${result}`
  }
  assertEquals({
    tag: result.tag,
    value: result.value.value
  }, output)
}))
