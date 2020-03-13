import {
  ValueExtractor
} from './types.ts'

import {
  ok,
  err
} from './utils.ts'

import {
  NotANumber,
  NotAnInteger,
  InvalidChoice
} from './value-errors.ts'

export const Text: ValueExtractor<string, readonly [string]> = {
  extract: ([raw]) => ok(raw),
  getTypeName: () => 'text'
}

export const FiniteNumber: ValueExtractor<number, readonly [string]> = {
  extract ([raw]) {
    const value = Number(raw)
    return isFinite(value)
      ? ok(value)
      : err(new NotANumber(raw))
  },
  getTypeName: () => 'number'
}

export const Integer: ValueExtractor<BigInt, readonly [string]> = {
  extract ([raw]) {
    try {
      return ok(BigInt(raw))
    } catch (error) {
      return err(new NotAnInteger(raw, error))
    }
  },
  getTypeName: () => 'integer'
}

export const Choice = <
  Value extends number | string
> (...choices: {
  readonly value: Value
  readonly describe?: string
}[]): ValueExtractor<Value, readonly [string]> => ({
  extract ([raw]) {
    for (const { value } of choices) {
      if (value === raw || value === Number(raw)) return ok(value)
    }
    return err(new InvalidChoice(raw, choices.map(x => x.value)))
  },
  getTypeName: () => choices.map(x => x.value).join('|')
})
