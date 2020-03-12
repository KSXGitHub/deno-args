import {
  ParseError
} from './types.ts'

export abstract class ValueError implements ParseError {
  public abstract readonly raw: string
  public abstract toString (): string
}

export class NotANumber extends ValueError {
  constructor (
    public readonly raw: string
  ) {
    super()
  }

  public toString () {
    return `Not a number: ${this.raw}`
  }
}

export class NotAnInteger extends ValueError {
  constructor (
    public readonly raw: string,
    public readonly error: SyntaxError
  ) {
    super()
  }

  public toString () {
    return `Not an integer: ${this.raw} (${this.error})`
  }
}
