import type { NamedLookup, SetCollectorLookup } from './types'

const SCRYFALL_HOST = /(^|\.)scryfall\.com$/i

/** Parse a Scryfall card page or API URL into a fetchable API path, or null. */
export function parseScryfallUrl(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  if (!SCRYFALL_HOST.test(url.hostname)) return null

  // https://api.scryfall.com/cards/...
  if (url.hostname.startsWith('api.')) {
    if (url.pathname.startsWith('/cards/')) return url.pathname + url.search
    return null
  }

  // https://scryfall.com/card/{set}/{number}/{slug?}
  const page = url.pathname.match(/^\/card\/([^/]+)\/([^/]+)(?:\/|$)/i)
  if (page) {
    const set = encodeURIComponent(page[1]!)
    const num = encodeURIComponent(decodeURIComponent(page[2]!))
    return `/cards/${set}/${num}`
  }

  // https://scryfall.com/cards/{uuid}
  const byId = url.pathname.match(/^\/cards\/([0-9a-f-]{36})(?:\/|$)/i)
  if (byId) return `/cards/${byId[1]}`

  return null
}

/** Detect "SET 123a" / "set:lea number:232" style shortcuts. */
export function parseSetCollector(input: string): SetCollectorLookup | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const tagged = trimmed.match(
    /^set\s*:\s*([a-z0-9]{2,5})\s+(?:number|collector)\s*:\s*(\S+)$/i,
  )
  if (tagged) {
    return { set: tagged[1]!.toLowerCase(), collectorNumber: tagged[2]! }
  }

  const spaced = trimmed.match(/^([a-z0-9]{2,5})\s+(\d+\S*)$/i)
  if (spaced) {
    return { set: spaced[1]!.toLowerCase(), collectorNumber: spaced[2]! }
  }

  return null
}

export function asNamedLookup(name: string, set?: string): NamedLookup {
  const n = name.trim()
  if (set?.trim()) return { kind: 'exact', name: n, set: set.trim().toLowerCase() }
  return { kind: 'fuzzy', name: n }
}
