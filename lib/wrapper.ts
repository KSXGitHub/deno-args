import {
  ParseError,
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
  SubCommandReturn,
  ParseFailure
} from './command-types.ts'

import help from './help.ts'

type ParseResult<
  Main extends CommandReturn<any, any, any>,
  ErrList extends readonly ParseError[]
> = Main | ParseFailure<ErrList>

class Wrapper<
  MainVal,
  Main extends CommandReturn<any, any, any>,
  ErrList extends readonly ParseError[]
> {
  constructor (
    private readonly _command: Command<Main, ErrList>
  ) {}

  public parse (args: readonly string[]): ParseResult<Main, ErrList> {
    return this._command.extract([...iterateArguments(args)])
  }

  public with<
    NextKey extends string,
    NextVal
  > (
    extractor: FlagType<NextKey, NextVal>
  ): Wrapper<
    MainVal & Record<NextKey, NextVal>,
    FlaggedCommandReturn<MainVal, NextKey, NextVal>,
    readonly ParseError[]
  > {
    return new Wrapper(FlaggedCommand(this._command, extractor))
  }

  public sub<
    Name extends string,
    SubVal extends CommandReturn<any, any, any>,
    NextErrList extends readonly ParseError[]
  > (
    name: Name,
    sub: Wrapper<MainVal, SubVal, ErrList>
  ): Wrapper<
    SubVal,
    SubCommandReturn<Main, Name, SubVal>,
    ErrList | NextErrList
  > {
    return new Wrapper(SubCommand(this._command, name, sub._command))
  }

  public help (): string {
    return help(this._command)
  }
}

export const args = new Wrapper(BLANK)
export default args
