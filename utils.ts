import {
  ParseSuccess,
  ParseFailure,
  ParseError,
  ArgvItem
} from './types.ts'

export const ok = <Value> (value: Value): ParseSuccess<Value> => ({
  tag: true,
  value
})

export const err = (error: ParseError): ParseFailure => ({
  tag: false,
  error
})

export const flagPrefix = (name: string): '-' | '--' => name.length === 1 ? '-' : '--'
export const flag = (name: string) => flagPrefix(name) + name

export function * iterateArguments (args: readonly string[]) {
  let fn = (value: string): ArgvItem[] => {
    if (value === '--') {
      fn = value => ([{ isFlag: false, value }])
      return []
    }

    if (value.startsWith('--')) {
      return [{
        isFlag: true,
        value: value.slice('--'.length)
      }]
    }

    if (value.startsWith('-')) {
      return [...value.slice('_'.length)].map(value => ({
        isFlag: true,
        value
      }))
    }

    return [{
      isFlag: false,
      value
    }]
  }

  for (const x of args) {
    yield * fn(x)
  }
}

export function partition<X> (xs: Iterable<X>, fn: (x: X) => boolean) {
  const left: X[] = []
  const right: X[] = []
  for (const x of xs) {
    (fn(x) ? left : right).push(x)
  }
  return [left, right]
}

export function find<X> (xs: Iterable<X>, fn: (x: X) => boolean) {
  let index = 0
  for (const value of xs) {
    if (fn(value)) return { index, value }
    index += 1
  }
  return null
}
