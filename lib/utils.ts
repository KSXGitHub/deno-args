import {
  Ok,
  Err,
  ParseError,
  ArgvItem
} from './types.ts'

export const ok = <Value> (value: Value): Ok<Value> => ({
  tag: true,
  value
})

export const err = <Error extends ParseError> (error: Error): Err<Error> => ({
  tag: false,
  error
})

export const record = <
  Key extends string | number | symbol,
  Value
> (
  key: Key,
  value: Value
) => ({ [key]: value }) as Record<Key, Value>

export const flagPrefix = (name: string): '-' | '--' => name.length === 1 ? '-' : '--'

export function flag (name: string | readonly string[]) {
  switch (typeof name) {
    case 'string':
      return flagPrefix(name)
    case 'object':
      return '-' + name.join('')
  }
}

export function * iterateArguments (args: readonly string[]) {
  let fn = (raw: string, index: number): ArgvItem[] => {
    if (raw === '--') {
      fn = (raw, index) => ([{ type: 'value', index, raw }])
      return []
    }

    if (raw.startsWith('--')) {
      return [{
        type: 'single-flag',
        name: raw.slice('--'.length),
        index,
        raw
      }]
    }

    if (raw.startsWith('-') && isNaN(raw as any)) {
      return [{
        type: 'multi-flag',
        name: [...raw.slice('-'.length)],
        index,
        raw
      }]
    }

    return [{
      type: 'value',
      index,
      raw
    }]
  }

  for (let i = 0; i !== args.length; ++i) {
    yield * fn(args[i], i)
  }
}

export function partition<X0, X1 extends X0> (
  xs: Iterable<X0>,
  fn: (x: X0) => x is X1
): [X1[], X0[]] {
  const left: X1[] = []
  const right: X0[] = []
  for (const x of xs) {
    (fn(x) ? left : right).push(x)
  }
  return [left, right]
}

type ArgvFlag = ArgvItem.SingleFlag | ArgvItem.MultiFlag

const flagPredicate = (names: readonly string[]) => (item: ArgvItem): item is ArgvFlag => {
  switch (item.type) {
    case 'single-flag':
      return names.includes(item.name)
    case 'multi-flag':
      return item.name.some(flag => names.includes(flag))
    case 'value':
      return false
  }
}

export const partitionFlags = (
  args: Iterable<ArgvItem>,
  names: readonly string[]
) => partition(args, flagPredicate(names))

export const findFlags = (
  args: readonly ArgvItem[],
  names: readonly string[]
) => args.filter(flagPredicate(names))
