import {
  ParseError
} from './types.ts'

abstract class ErrorBase implements ParseError {
  public abstract toString (): string
}

export class UnknownOptions extends ErrorBase {
  constructor (
    public readonly options: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Unknown options: ${this.options.join(', ')}`
  }
}
