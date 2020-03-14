import './polyfill.js'

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

const __toString = Symbol()
type __toString = typeof __toString

type _ParseReturn<This extends ParserBase<any, any, any>> = ParseResult<{
  value: This[__parseResult]
  remainingArgs: string[]
}, readonly FlagError[]>

export abstract class ParserBase<
  Name extends string,
  Value,
  Next extends ParserBase<any, any, any>
> {
  /** Type helper */
  declare public [__parseResult]: Record<Name, Value> & Next[__parseResult]
  protected abstract [__parse] (args: ArgvItem[]): _ParseReturn<this>
  protected abstract [__help] (): string
  protected abstract [__toString] (): readonly string[]

  public parse (args: readonly string[]): ParseResult<this[__parseResult], FlagError> {
    const res = this[__parse]([...iterateArguments(args)])
    if (!res.tag) return res
    return ok({
      ...res.value.value,
      _: res.value.remainingArgs
    })
  }

  public with<NextName extends string, NextValue> (
    extractor: ArgumentExtractor<NextName, NextValue>
  ): ParserBase<NextName, NextValue, this> {
    return new ParserNode(extractor, this)
  }

  public help (): string {
    return this[__help]()
  }

  public [Deno.symbols.customInspect] () {
    const segments = this[__toString]()
    if (!segments.length) return 'Parser {}'
    const middle = segments.map(segment => '  ' + segment).join('\n')
    return `Parser {\n${middle}\n}`
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

  protected [__parse] (args: ArgvItem[]): _ParseReturn<this> {
    const current = this._extractor.extract(args)
    const next = this._next[__parse](current.value?.remainingArgs || [])
    if (!current.tag || !next.tag) {
      const errors = []
      if (current.error) errors.push(current.error)
      if (next.error) errors.push(...next.error)
      return err(errors)
    }
    const value = {
      [this._extractor.name]: current.value.value,
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

  protected [__toString] (): string[] {
    const { _next, _extractor } = this
    return [
      `${_extractor.name}: ${_extractor[Symbol.toStringTag]}`,
      ..._next[__toString]()
    ]
  }
}

export class EmptyParser extends ParserBase<never, never, any> {
  /** Type helper */
  declare public [__parseResult]: {}

  public [__parse] (args: ArgvItem[]): _ParseReturn<this> {
    const [flags, nonFlags] = partition(args, x => x.isFlag)
    if (flags.length) {
      return err([new UnknownFlags(flags.map(x => x.name!))])
    }
    return ok({
      value: {} as never,
      remainingArgs: nonFlags.map(x => x.raw)
    })
  }

  protected [__help] (): string {
    return ''
  }

  protected [__toString] (): [] {
    return []
  }
}

export const build = () => new EmptyParser()

export default build
