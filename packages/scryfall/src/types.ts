/** Subset of Scryfall card JSON used by UMPS+1. */

export type ScryfallImageUris = {
  art_crop?: string
  normal?: string
  large?: string
  png?: string
  border_crop?: string
}

export type ScryfallCardFace = {
  name?: string
  mana_cost?: string
  type_line?: string
  oracle_text?: string
  power?: string
  toughness?: string
  image_uris?: ScryfallImageUris
}

export type ScryfallCard = {
  id: string
  name: string
  mana_cost?: string
  type_line?: string
  oracle_text?: string
  power?: string
  toughness?: string
  set: string
  set_name?: string
  collector_number: string
  rarity?: string
  lang?: string
  uri: string
  scryfall_uri: string
  prints_search_uri?: string
  image_uris?: ScryfallImageUris
  card_faces?: ScryfallCardFace[]
}

export type ScryfallList<T> = {
  object: 'list'
  total_cards?: number
  has_more?: boolean
  next_page?: string
  data: T[]
}

export type ScryfallErrorBody = {
  object: 'error'
  code: string
  status: number
  details: string
  type?: string
}

export class ScryfallError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, details: string) {
    super(details)
    this.name = 'ScryfallError'
    this.status = status
    this.code = code
  }
}

export type NamedLookup =
  | { kind: 'fuzzy'; name: string }
  | { kind: 'exact'; name: string; set?: string }

export type SetCollectorLookup = {
  set: string
  collectorNumber: string
}
