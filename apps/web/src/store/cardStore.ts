import { create } from 'zustand'
import {
  createBlankCard,
  type ArtPlacement,
  type CardDocument,
} from '@/domain/card/document'

export type EditorMode = 'edit' | 'art' | 'export'

type CardState = {
  card: CardDocument
  mode: EditorMode
  inspectorOpen: boolean
  setMode: (mode: EditorMode) => void
  setInspectorOpen: (open: boolean) => void
  patchCard: (patch: Partial<CardDocument>) => void
  patchArt: (patch: Partial<ArtPlacement>) => void
  setArtUrl: (url: string | null) => void
  resetCard: () => void
}

export const useCardStore = create<CardState>((set, get) => ({
  card: createBlankCard(),
  mode: 'edit',
  inspectorOpen: false,
  setMode: (mode) => set({ mode, inspectorOpen: true }),
  setInspectorOpen: (open) => set({ inspectorOpen: open }),
  patchCard: (patch) => set({ card: { ...get().card, ...patch } }),
  patchArt: (patch) =>
    set({ card: { ...get().card, art: { ...get().card.art, ...patch } } }),
  setArtUrl: (url) => {
    const prev = get().card.artUrl
    if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
    set({ card: { ...get().card, artUrl: url } })
  },
  resetCard: () => {
    const prev = get().card.artUrl
    if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev)
    set({ card: createBlankCard() })
  },
}))
