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

/**
 * Assert that there is no duplicated choice.
 * If there is duplication, throw an error.
 * @param choices Arguments that {@link Choice} received
 */
function checkDuplicatedChoices (choices: readonly {
  readonly value: number | string
}[]) {
  const values = choices.map(x => String(x.value))
  const duplications = values.filter((x, i) => values.indexOf(x) !== i)
  if (duplications.length) throw new Error(`Duplicated choices: ${duplications.join(' ')}`)
}

export const Choice = <
  Value extends number | string
> (...choices: {
  readonly value: Value
  readonly describe?: string
}[]): ValueExtractor<Value, readonly [string]> => ({
  extract ([raw]) {
    checkDuplicatedChoices(choices)
    for (const { value } of choices) {
      if (value === raw || value === Number(raw)) return ok(value)
    }
    return err(new InvalidChoice(raw, choices.map(x => x.value)))
  },
  getTypeName: () => choices.map(x => x.value).join('|')
})
