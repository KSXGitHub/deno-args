import {
  MAIN_COMMAND,
  command,
  inspect,
  __denoInspect
} from './symbols.ts'

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
} from './argument-errors.ts'

declare const __parseResult: unique symbol
type __parseResult = typeof __parseResult

const __parse = Symbol()
type __parse = typeof __parse

const __help = Symbol()
type __help = typeof __help

const __toString = Symbol()
type __toString = typeof __toString

type _ParseResult<Val> = ParseResult<{
  readonly value: Val
  readonly consumedArgs: Set<ArgvItem>
}, readonly FlagError[]>

abstract class CommandBase<Val> {
  protected abstract [__parse] (args: readonly ArgvItem[]): _ParseResult<Val>
  // protected abstract [__help] (): string
  // protected abstract [__toString] (): readonly string[]

  public and<NextVal> (
    next: CommandBase<NextVal>
  ): CommandBase<Val & NextVal> {
    return new Intersection(this, next)
  }

  public or<NextVal> (
    next: CommandBase<NextVal>
  ): CommandBase<Val | NextVal> {
    return new Union(this, next)
  }

  public with<NextName extends string, NextVal> (
    extractor: ArgumentExtractor<NextName, NextVal>
  ): CommandBase<Val & Record<NextName, NextVal>> {
    return this.and(new ExtractorWrapper(extractor))
  }

  public subCommand<NextTag extends string, NextVal> (
    name: NextTag,
    parser: CommandBase<NextVal>
  ): CommandBase<Val |TaggedVal<NextTag, NextVal>> {
    return this.or(new NamedSubCommand(name, parser))
  }

  public parse (args: readonly string[]) {
    const result = this[__parse]([...iterateArguments(args)])
    if (!result.tag) return result
    return {
      value: result.value.value,
      consumedArgs: result.value.consumedArgs,
      tag: true
    } as const
  }
}

const __combine = Symbol()
type __combine = typeof __combine
abstract class Combine<A, B, C> extends CommandBase<C> {
  protected readonly [__combine]: readonly [
    CommandBase<A>,
    CommandBase<B>
  ]

  constructor (
    a: CommandBase<A>,
    b: CommandBase<B>
  ) {
    super()
    this[__combine] = [a, b]
  }
}

class Intersection<A, B> extends Combine<A, B, A & B> {
  protected [__parse] (args: readonly ArgvItem[]): _ParseResult<A & B> {
    const [A, B] = this[__combine]
    const a = A[__parse](args)
    const b = B[__parse](args)
    if (a.tag && b.tag) {
      const value = { ...a.value.value, ...b.value.value }
      const consumedArgs = new Set([...a.value.consumedArgs, ...b.value.consumedArgs])
      return ok({ value, consumedArgs })
    }
    return err([
      ...a.error || [],
      ...b.error || []
    ])
  }
}

class Union<A, B> extends Combine<A, B, A | B> {
  protected [__parse] (args: readonly ArgvItem[]): _ParseResult<A | B> {
    const [A, B] = this[__combine]
    const b = B[__parse](args)
    if (b.tag) return b
    const a = A[__parse](args)
    if (a.tag) return a
    return err([...a.error, ...b.error])
  }
}

type TaggedRec<Tag, Name extends string, Val> = Record<command, Tag> & Record<Name, Val>

class ExtractorWrapper<Tag, Name extends string, Val> extends CommandBase<TaggedRec<Tag, Name, Val>> {
  constructor (
    private readonly _extractor: ArgumentExtractor<Name, Val>
  ) {
    super()
  }

  protected [__parse] (args: readonly ArgvItem[]): _ParseResult<TaggedRec<Tag, Name, Val>> {

  }
}

type TaggedVal<Tag, Val> = Val & Record<command, Tag>

abstract class NamedCommand<Name extends string | MAIN_COMMAND, Val>
extends CommandBase<TaggedVal<Name, Val>> {
  abstract readonly name: Name
  protected abstract [__parse] (): _ParseResult<TaggedVal<Name, Val>>
}

class NamedSubCommand<Name extends string, Val> extends NamedCommand<Name, Val> {
  constructor (
    public readonly name: Name,
    private readonly _parser: CommandBase<Val>
  ) {
    super()
  }

  protected [__parse] (): _ParseResult<TaggedVal<Name, Val>> {

  }
}

export interface Command<Val> extends CommandBase<Val> {}

export default Command
