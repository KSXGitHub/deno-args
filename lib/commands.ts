import {
  MAIN_COMMAND,
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

type _ParseResult<Tag, Val> = ParseResult<{
  readonly tag: Tag
  readonly value: Val
  readonly consumedArgs: WeakSet<ArgvItem>
}, readonly FlagError[]>

export abstract class CommandBase<Tag, Val> {
  public abstract readonly commandType: Tag
  protected abstract [__parse] (args: readonly ArgvItem[]): _ParseResult<Tag, Val>
  protected abstract [__help] (): string
  protected abstract [__toString] (): readonly string[]

  public and<NextTag, NextVal> (
    next: CommandBase<NextTag, NextVal>
  ): CommandBase<Tag, Val & NextVal> {
    return new Intersection(this, next)
  }

  public or<NextTag, NextVal> (
    next: CommandBase<NextTag, NextVal>
  ): CommandBase<Tag, Val | NextVal> {
    return new Union(this, next)
  }
}

const __combine = Symbol()
type __combine = typeof __combine
abstract class Combine<AT, BT, AV, BV, C> extends CommandBase<AT, C> {
  protected readonly [__combine]: readonly [
    CommandBase<AT, AV>,
    CommandBase<BT, BV>
  ]

  constructor (
    a: CommandBase<AT, AV>,
    b: CommandBase<BT, BV>
  ) {
    super()
    this[__combine] = [a, b]
  }
}

class Intersection<AT, BT, AV, BV> extends Combine<AT, BT, AV, BV, AV & BV> {

}

class Union<AT, BT, AV, BV> extends Combine<AT, BT, AV, BV, AV | BV> {

}
