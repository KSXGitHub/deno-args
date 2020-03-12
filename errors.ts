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

export class MissingOption extends ErrorBase {
  constructor (
    public readonly optionName: string
  ) {
    super()
  }

  public toString () {
    return `Option ${this.optionName} is required but missing`
  }
}

export class ConflictOptions extends ErrorBase {
  constructor (
    public readonly options: readonly string[]
  ) {
    super()
  }

  public toString () {
    return `Conflicting options: ${this.options.join(', ')}`
  }
}
