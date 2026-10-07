import { useEffect, useRef } from 'react'
import {
  blobFromArtUrl,
  loadVault,
  recordToCard,
  saveVault,
} from '@/features/scryfall/vault'
import { useCardStore } from '@/store/cardStore'

const SAVE_DEBOUNCE_MS = 400

/**
 * Hydrate the card store from IndexedDB on mount, then persist
 * the current card + art blob after edits (debounced).
 */
export function useCardVault() {
  const hydrated = useRef(false)
  const replaceCard = useCardStore((s) => s.replaceCard)
  const card = useCardStore((s) => s.card)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const record = await loadVault()
        if (cancelled) return
        if (record) {
          replaceCard(recordToCard(record))
        }
      } catch {
        // Vault is best-effort; blank card remains.
      } finally {
        if (!cancelled) hydrated.current = true
      }
    })()
    return () => {
      cancelled = true
    }
  }, [replaceCard])

  useEffect(() => {
    if (!hydrated.current) return
    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          const artBlob = await blobFromArtUrl(card.artUrl)
          await saveVault(card, artBlob)
        } catch {
          // ignore persistence failures
        }
      })()
    }, SAVE_DEBOUNCE_MS)
    return () => window.clearTimeout(handle)
  }, [card])
}
