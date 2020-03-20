export const MAIN_COMMAND = Symbol('MAIN_COMMAND')
export type MAIN_COMMAND = typeof MAIN_COMMAND
export const PARSE_FAILURE = Symbol('PARSE_FAILURE')
export type PARSE_FAILURE = typeof PARSE_FAILURE
export const inspect = Symbol('inspect')
export const __denoInspect: typeof Deno.symbols.customInspect =
  (globalThis.Deno?.symbols?.customInspect || Symbol()) as any
