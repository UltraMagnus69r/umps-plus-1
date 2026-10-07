export type ArtPlacement = {
  /** Horizontal pan in art-box space (px @ stage). */
  offsetX: number
  /** Vertical pan in art-box space (px @ stage). */
  offsetY: number
  /** Uniform scale relative to cover-fit (1 = cover). */
  scale: number
}

export type CardDocument = {
  name: string
  mana: string
  typeLine: string
  rules: string
  power: string
  toughness: string
  /** Object URL or data URL; null when unset. */
  artUrl: string | null
  art: ArtPlacement
  /** Solid fill behind the card (bleed + face). */
  faceColor: string
}

export const DEFAULT_ART: ArtPlacement = {
  offsetX: 0,
  offsetY: 0,
  scale: 1,
}

export function createBlankCard(): CardDocument {
  return {
    name: 'Card Name',
    mana: '2G',
    typeLine: 'Creature — Example',
    rules: 'Enter a rules text line.\n\nFlavor stays in the same box for Phase 1.',
    power: '2',
    toughness: '2',
    artUrl: null,
    art: { ...DEFAULT_ART },
    faceColor: '#d8d2c4',
  }
}
