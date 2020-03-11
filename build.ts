import {
  iterateArguments
} from './utils.ts'

import {
  Extractor,
  ParseResult,
  ArgvItem
} from './types.ts'

declare const __parseResult: unique symbol
type __parseResult = typeof __parseResult

type _ParseReturn<This extends Parser<any, any, any>> = ParseResult<{
  value: This[__parseResult]
  remainingArgs: string[]
}>

export class Parser<
  Name extends string,
  Value,
  Next extends Parser<any, any, any>
> {
  /** Type helper */
  declare public [__parseResult]: Record<Name, Value> & Next[__parseResult]

  constructor (
    private readonly _extractor: Extractor<Name, Value>,
    private readonly _next: Next
  ) {}

  private _parse (args: ArgvItem[]): _ParseReturn<this> {
    const current = this._extractor.extract(args)
    if (!current.tag) return current
    const next = this._next._parse(current.value.remainingArgs)
    if (!next.tag) return next
    const value = {
      [this._extractor.name]: current.value,
      ...next.value.value
    }
    const remainingArgs = next.value.remainingArgs
    return {
      tag: true,
      value: { value, remainingArgs }
    }
  }

  public parse (args: readonly string[]): ParseResult<this[__parseResult]> {
    const res = this._parse([...iterateArguments(args)])
    if (!res.tag) return res
    return {
      tag: true,
      value: {
        ...res.value.value,
        _: res.value.remainingArgs
      }
    }
  }
}

export const build = () => new Parser<never, never, never>()

export default build
