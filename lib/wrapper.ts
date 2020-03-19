import {
  ParseError,
  ParseResult,
  FlagType
} from './types.ts'

import {
  iterateArguments
} from './utils.ts'

import {
  BLANK,
  Command,
  FlaggedCommand,
  SubCommand,
  CommandReturn,
  FlaggedCommandReturn,
  SubCommandReturn
} from './command-types.ts'

class Wrapper<Main extends CommandReturn<any, any, any>, ErrList extends readonly ParseError[]> {
  constructor (
    private readonly _command: Command<Main, ErrList>
  ) {}

  public parse (args: readonly string[]): ParseResult<Main, ErrList> {
    return this._command.extract([...iterateArguments(args)])
  }

  public with<
    Name extends string,
    Value
  > (
    extractor: FlagType<Name, Value>
  ): Wrapper<FlaggedCommandReturn<Main, Name, Value>, readonly ParseError[]> {
    return new Wrapper(FlaggedCommand<Main, Name, Value>(this._command, extractor))
  }

  public sub<
    Name extends string,
    SubVal extends CommandReturn<any, any, any>,
    NextErrList extends readonly ParseError[]
  > (
    name: Name,
    sub: Wrapper<SubVal, ErrList>
  ): Wrapper<
    SubCommandReturn<Main, Name, SubVal>,
    ErrList | NextErrList
  > {
    return new Wrapper(SubCommand(this._command, name, sub._command))
  }
}

export const args = new Wrapper(BLANK)
export default args
