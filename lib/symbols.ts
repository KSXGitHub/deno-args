export const MAIN_COMMAND = Symbol('MAIN_COMMAND')
export type MAIN_COMMAND = typeof MAIN_COMMAND

export const command = Symbol('command')
export type command = typeof command

export const inspect = Symbol('inspect')
export const __denoInspect: typeof Deno.symbols.customInspect =
  (globalThis.Deno?.symbols?.customInspect || Symbol()) as any
