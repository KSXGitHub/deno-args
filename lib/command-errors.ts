import { FlagError } from './flag-errors.ts'
import { ParseError } from './types.ts'

/**
 * Class of error created by `CommandType::extract`
 * @template ErrList Type of array of {@link FlagError}
 */
export class CommandError<
  ErrList extends readonly FlagError[],
> implements ParseError, Iterable<FlagError> {
  /** Array of {@link FlagError} */
  public readonly errors: ErrList

  constructor(errors: ErrList) {
    this.errors = errors
  }

  public readonly toString = () =>
    this.errors
      .map(error => error.toString())
      .join('\n')

  public *[Symbol.iterator]() {
    yield* this.errors
  }
}
