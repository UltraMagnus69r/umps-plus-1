import type { CardDocument } from '@/domain/card/document'
import type { ScryfallCard } from '@umps-plus-1/scryfall'

/** Prefer front face fields for DFC / MDFC. */
function faceFields(card: ScryfallCard) {
  const face = card.card_faces?.[0]
  return {
    name: face?.name ?? card.name,
    manaCost: face?.mana_cost ?? card.mana_cost ?? '',
    typeLine: face?.type_line ?? card.type_line ?? '',
    oracle: face?.oracle_text ?? card.oracle_text ?? '',
    power: face?.power ?? card.power ?? '',
    toughness: face?.toughness ?? card.toughness ?? '',
    imageUris: face?.image_uris ?? card.image_uris,
  }
}

/** `{2}{G}{G}` → `2GG` to match the Phase 1 mana field. */
export function compactMana(manaCost: string): string {
  return manaCost.replace(/[{}]/g, '')
}

/** Preferred art URL: art_crop, then normal, then large. */
export function preferredArtUrl(card: ScryfallCard): string | null {
  const { imageUris } = faceFields(card)
  return imageUris?.art_crop ?? imageUris?.normal ?? imageUris?.large ?? null
}

/** Map Scryfall JSON → CardDocument fields (no art blob). */
export function mapScryfallToCard(card: ScryfallCard): Partial<CardDocument> {
  const f = faceFields(card)
  return {
    name: f.name,
    mana: compactMana(f.manaCost),
    typeLine: f.typeLine,
    rules: f.oracle,
    power: f.power,
    toughness: f.toughness,
  }
}

/** Thumbnail for print picker (not applied to the stage). */
export function previewThumbUrl(card: ScryfallCard): string | null {
  const { imageUris } = faceFields(card)
  return (
    imageUris?.border_crop ??
    imageUris?.normal ??
    imageUris?.art_crop ??
    null
  )
}
