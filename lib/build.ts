import {
  ok,
  err,
  iterateArguments,
  partition
} from './utils.ts'

import {
  ArgumentExtractor,
  ParseResult,
  ArgvItem
} from './types.ts'

import {
  FlagError,
  UnknownFlags
} from './flag-errors.ts'

declare const __parseResult: unique symbol
type __parseResult = typeof __parseResult

const __parse = Symbol()
type __parse = typeof __parse

const __help = Symbol()
type __help = typeof __help

type _ParseReturn = ParseResult<{
  value: any
  remainingArgs: string[]
}, FlagError>

abstract class ParserBase<
  Name extends string,
  Value,
  Next extends ParserBase<any, any, any>
> {
  /** Type helper */
  declare public [__parseResult]: Record<Name, Value> & Next[__parseResult]
  protected abstract [__parse] (args: ArgvItem[]): _ParseReturn
  protected abstract [__help] (): string

  public parse (args: readonly string[]): ParseResult<this[__parseResult], FlagError> {
    const res = this[__parse]([...iterateArguments(args)])
    if (!res.tag) return res
    const result: this[__parseResult] = Object.fromEntries(
      Object
        .entries(res.value.value)
        .map(([key, value]) => [key, (value as any).value])
    ) as any
    return ok({
      ...result,
      _: res.value.remainingArgs
    })
  }

  public with<NextName extends string, NextValue> (
    extractor: ArgumentExtractor<NextName, NextValue>
  ): ParserNode<NextName, NextValue, this> {
    return new ParserNode(extractor, this)
  }

  public help (): string {
    return this[__help]()
  }
}

class ParserNode<
  Name extends string,
  Value,
  Rest extends ParserBase<any, any, any>
> extends ParserBase<Name, Value, Rest> {
  constructor (
    private readonly _extractor: ArgumentExtractor<Name, Value>,
    private readonly _next: Rest
  ) {
    super()
  }

  protected [__parse] (args: ArgvItem[]): _ParseReturn {
    const current = this._extractor.extract(args)
    if (!current.tag) return current
    const next = this._next[__parse](current.value.remainingArgs)
    if (!next.tag) return next
    const value = {
      [this._extractor.name]: current.value,
      ...next.value.value
    }
    const remainingArgs = next.value.remainingArgs
    return ok({ value, remainingArgs })
  }

  protected [__help] (): string {
    const current = this._extractor.help()
    const next = this._next[__help]()
    return current + '\n' + next
  }
}

class EmptyParser extends ParserBase<never, never, any> {
  /** Type helper */
  declare public [__parseResult]: {}

  public [__parse] (args: ArgvItem[]): _ParseReturn {
    const [flags, nonFlags] = partition(args, x => x.isFlag)
    if (flags.length) {
      return err(new UnknownFlags(flags.map(x => x.name!)))
    }
    return ok({
      value: {} as never,
      remainingArgs: nonFlags.map(x => x.raw)
    })
  }

  protected [__help] (): string {
    return ''
  }
}

export const build = () => new EmptyParser()

export default build
