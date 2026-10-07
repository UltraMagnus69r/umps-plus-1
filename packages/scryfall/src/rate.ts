/**
 * Tiny sequential gate so we do not hammer Scryfall.
 * Default gap follows their ~50–100 ms guidance with a little headroom.
 */
export class RequestGate {
  private chain: Promise<void> = Promise.resolve()
  private readonly minGapMs: number

  constructor(minGapMs = 110) {
    this.minGapMs = minGapMs
  }

  schedule<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.chain.then(async () => {
      const started = performance.now()
      try {
        return await fn()
      } finally {
        const elapsed = performance.now() - started
        const wait = Math.max(0, this.minGapMs - elapsed)
        if (wait > 0) await sleep(wait)
      }
    })
    // Keep the chain alive even when a request fails.
    this.chain = run.then(
      () => undefined,
      () => undefined,
    )
    return run
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
