import {
  ParseError
} from './types.ts'

import {
  FlagError
} from './flag-errors.ts';

export class CommandError<
  ErrList extends readonly FlagError[]
> implements ParseError, Iterable<FlagError> {
  constructor (
    public readonly errors: ErrList
  ) {}

  public readonly toString = () => this.errors
    .map(error => error.toString())
    .join('\n')

  public * [Symbol.iterator] () {
    yield * this.errors
  }
}
