import {
  ParseError
} from './types.ts'

import {
  FlagError
} from './flag-errors.ts';

export class CommandError<
  ErrList extends readonly FlagError[]
> implements ParseError {
  constructor (
    public readonly errors: ErrList
  ) {}

  public readonly toString = () => this.errors
    .map(error => error.toString())
    .join('\n')
}
