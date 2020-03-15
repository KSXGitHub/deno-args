export const inspect = Symbol('inspect')
export const __denoInspect: typeof Deno.symbols.customInspect =
  (globalThis.Deno?.symbols?.customInspect || Symbol()) as any
