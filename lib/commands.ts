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

type CommandTypeBound = MAIN_COMMAND | string

export abstract class CommandBase<
  CommandType extends CommandTypeBound,
  Value
> {
  public abstract readonly commandType: CommandType
  protected abstract [__parse] (args: readonly ArgvItem[]): ParseResult<Value, readonly FlagError[]>
  protected abstract [__help] (): string
  protected abstract [__toString] (): readonly string[]
}
