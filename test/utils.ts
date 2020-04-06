import { TemplateTag, shEsc } from './deps.ts'

export const dbg = TemplateTag(Deno.inspect)

export function tryExec<Value, ExpectedError> (
  fn: () => Value,
  expectError: (error: unknown) => error is ExpectedError
): tryExec.Result<Value, ExpectedError> {
  try {
    return {
      tag: true,
      value: fn()
    }
  } catch (error) {
    if (!expectError(error)) throw error
    return {
      tag: false,
      error
    }
  }
}

export namespace tryExec {
  export type Result<Value, ExpectedError> = {
    readonly tag: true
    readonly value: Value
    readonly error?: null
  } | {
    readonly tag: false
    readonly error: ExpectedError
    readonly value?: null
  }
}

export const fmtArgv = (argv: readonly string[]) => argv
  .map(item => item.trim() ? shEsc.singleArgument(item) : "'" + item + "'")
  .join(' ')

export const fmtTestName = (title: string, argv: readonly string[]) => `${title} (${fmtArgv(argv)})`
