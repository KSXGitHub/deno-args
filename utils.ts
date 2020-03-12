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

export function partition<X> (xs: Iterable<X>, fn: (x: X) => boolean): [X[], X[]] {
  const left: X[] = []
  const right: X[] = []
  for (const x of xs) {
    (fn(x) ? left : right).push(x)
  }
  return [left, right]
}

const flagMapFn = (item: ArgvItem, index: number) => ({ ...item, index })

const flagPredicate = (names: readonly string[]) =>
  (item: ArgvItem) => item.isFlag && names.includes(item.value)

export const partitionFlags = (
  args: Iterable<ArgvItem>,
  names: readonly string[]
) => partition(
  [...args].map(flagMapFn),
  flagPredicate(names)
)

export const findFlags = (
  args: readonly ArgvItem[],
  names: readonly string[]
) => args
  .map(flagMapFn)
  .filter(flagPredicate(names))
