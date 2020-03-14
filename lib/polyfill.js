if (typeof Deno === 'undefined') {
  globalThis.Deno = {
    symbols: {
      customInspect: Symbol()
    }
  }
}
