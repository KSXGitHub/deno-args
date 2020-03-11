import {
  iterateArguments,
  partition
} from './utils.ts'

import {
  Extractor,
  ParseResult,
  ArgvItem
} from './types.ts'

import {
  UnknownOptions
} from './errors.ts'

declare const __parseResult: unique symbol
type __parseResult = typeof __parseResult

const __parse = Symbol()
type __parse = typeof __parse

type _ParseReturn<This extends ParserBase<any, any, any>> = ParseResult<{
  value: This[__parseResult]
  remainingArgs: string[]
}>

abstract class ParserBase<
  Name extends string,
  Value,
  Next extends ParserBase<any, any, any>
> {
  /** Type helper */
  declare public [__parseResult]: Record<Name, Value> & Next[__parseResult]
  public abstract [__parse] (args: ArgvItem[]): _ParseReturn<this>

  public parse (args: readonly string[]): ParseResult<this[__parseResult]> {
    const res = this[__parse]([...iterateArguments(args)])
    if (!res.tag) return res
    return {
      tag: true,
      value: {
        ...res.value.value,
        _: res.value.remainingArgs
      }
    }
  }

  public with<NextName extends string, NextValue> (extractor: Extractor<NextName, NextValue>) {
    return new ParserNode(extractor, this)
  }
}

class ParserNode<
  Name extends string,
  Value,
  Rest extends ParserBase<any, any, any>
> extends ParserBase<Name, Value, Rest> {
  /** Type helper */
  declare public [__parseResult]: Record<Name, Value> & Rest[__parseResult]

  constructor (
    private readonly _extractor: Extractor<Name, Value>,
    private readonly _next: Rest
  ) {
    super()
  }

  public [__parse] (args: ArgvItem[]): _ParseReturn<this> {
    const current = this._extractor.extract(args)
    if (!current.tag) return current
    const next = this._next[__parse](current.value.remainingArgs)
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
}

class EmptyParser extends ParserBase<never, never, never> {
  public [__parse] (args: ArgvItem[]): _ParseReturn<this> {
    const [flags, nonFlags] = partition(args, x => x.isFlag)
    if (flags.length) {
      return {
        tag: false,
        error: new UnknownOptions(flags.map(x => x.value))
      }
    }
    return {
      tag: true,
      value: {
        value: {} as never,
        remainingArgs: nonFlags.map(x => x.value)
      }
    }
  }
}

export const build = () => new EmptyParser()

export default build
