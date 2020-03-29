import {
  ParseError
} from './types.ts'

import {
  FlagError
} from './flag-errors.ts';

/**
 * Class of error created by `CommandType::extract`
 * @template ErrList Type of array of {@link FlagError}
 */
export class CommandError<
  ErrList extends readonly FlagError[]
> implements ParseError, Iterable<FlagError> {
  /**
   * @param errors Array of {@link FlagError}
   */
  constructor (
    public readonly errors: ErrList
  ) {}

  /**
   * Get readable error message
   */
  public readonly toString = () => this.errors
    .map(error => error.toString())
    .join('\n')

  /**
   * Iterate through `this.errors`
   */
  public * [Symbol.iterator] () {
    yield * this.errors
  }
}
