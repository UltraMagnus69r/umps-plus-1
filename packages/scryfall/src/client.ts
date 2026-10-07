import { parseScryfallUrl, parseSetCollector } from './parse'
import { RequestGate } from './rate'
import {
  ScryfallError,
  type NamedLookup,
  type ScryfallCard,
  type ScryfallErrorBody,
  type ScryfallList,
  type SetCollectorLookup,
} from './types'

const DEFAULT_BASE = 'https://api.scryfall.com'
const DEFAULT_UA = 'UMPS-Plus-1/0.1'

export type ScryfallClientOptions = {
  baseUrl?: string
  /** Identifying UA (honored in Node; browsers may override). */
  userAgent?: string
  /** Minimum gap between requests (ms). */
  minGapMs?: number
  fetch?: typeof fetch
}

export class ScryfallClient {
  private readonly baseUrl: string
  private readonly userAgent: string
  private readonly gate: RequestGate
  private readonly fetchImpl: typeof fetch

  constructor(opts: ScryfallClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '')
    this.userAgent = opts.userAgent ?? DEFAULT_UA
    this.gate = new RequestGate(opts.minGapMs ?? 110)
    this.fetchImpl = opts.fetch ?? fetch.bind(globalThis)
  }

  /** Fuzzy or exact name lookup (`/cards/named`). */
  named(lookup: NamedLookup): Promise<ScryfallCard> {
    const params = new URLSearchParams()
    if (lookup.kind === 'fuzzy') {
      params.set('fuzzy', lookup.name)
    } else {
      params.set('exact', lookup.name)
      if (lookup.set) params.set('set', lookup.set)
    }
    return this.getJson<ScryfallCard>(`/cards/named?${params}`)
  }

  /** Set code + collector number (`/cards/{set}/{number}`). */
  bySetCollector(lookup: SetCollectorLookup): Promise<ScryfallCard> {
    const set = encodeURIComponent(lookup.set.toLowerCase())
    const num = encodeURIComponent(lookup.collectorNumber)
    return this.getJson<ScryfallCard>(`/cards/${set}/${num}`)
  }

  /** Fetch a card by Scryfall UUID. */
  byId(id: string): Promise<ScryfallCard> {
    return this.getJson<ScryfallCard>(`/cards/${encodeURIComponent(id)}`)
  }

  /**
   * Resolve a Scryfall page/API URL, set+collector shortcut, or fuzzy name.
   * Optional `set` forces exact named lookup with that set.
   */
  async resolve(
    input: string,
    opts: { set?: string } = {},
  ): Promise<ScryfallCard> {
    const trimmed = input.trim()
    if (!trimmed) throw new ScryfallError(400, 'bad_request', 'Enter a card name or URL.')

    const apiPath = parseScryfallUrl(trimmed)
    if (apiPath) return this.getJson<ScryfallCard>(apiPath)

    const sc = parseSetCollector(trimmed)
    if (sc && !opts.set) return this.bySetCollector(sc)

    if (opts.set?.trim()) {
      return this.named({
        kind: 'exact',
        name: trimmed,
        set: opts.set.trim().toLowerCase(),
      })
    }

    return this.named({ kind: 'fuzzy', name: trimmed })
  }

  /**
   * Print search with `unique=prints`.
   * Prefer the card's `prints_search_uri` when available.
   */
  async printsFor(card: ScryfallCard): Promise<ScryfallCard[]> {
    if (card.prints_search_uri) {
      return this.collectList(card.prints_search_uri)
    }
    const q = `!"${card.name}"`
    return this.searchPrints(q)
  }

  /** Free-form Scryfall search forced to unique prints. */
  searchPrints(query: string): Promise<ScryfallCard[]> {
    const params = new URLSearchParams({
      q: query,
      unique: 'prints',
      order: 'released',
    })
    return this.collectList(`${this.baseUrl}/cards/search?${params}`)
  }

  private async collectList(urlOrPath: string): Promise<ScryfallCard[]> {
    const out: ScryfallCard[] = []
    let next: string | null = urlOrPath
    while (next) {
      const page: ScryfallList<ScryfallCard> =
        await this.getJson<ScryfallList<ScryfallCard>>(next)
      out.push(...page.data)
      next = page.has_more && page.next_page ? page.next_page : null
      // Cap pages for this lightweight slice (prints lists are usually short).
      if (out.length >= 175) break
    }
    return out
  }

  private getJson<T>(urlOrPath: string): Promise<T> {
    const url = urlOrPath.startsWith('http')
      ? urlOrPath
      : `${this.baseUrl}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`

    return this.gate.schedule(async () => {
      const res = await this.fetchImpl(url, {
        headers: {
          Accept: 'application/json',
          // Browsers may ignore User-Agent; Node / custom fetch keeps it.
          'User-Agent': this.userAgent,
        },
      })

      const body: unknown = await res.json().catch(() => null)

      if (!res.ok) {
        const err = body as ScryfallErrorBody | null
        throw new ScryfallError(
          res.status,
          err?.code ?? 'unknown',
          err?.details ?? `Scryfall request failed (${res.status})`,
        )
      }

      return body as T
    })
  }
}

/** Shared default client for the web app. */
export const scryfall = new ScryfallClient()
