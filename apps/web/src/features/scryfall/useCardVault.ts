import { useEffect } from 'react'
import { clearVault } from '@/features/scryfall/vault'

/**
 * On full page load: wipe the IndexedDB vault so a browser refresh starts
 * from the blank/default card. Auto-hydrate and auto-persist of "last card"
 * are intentionally off; an explicit save action can return later.
 */
export function useCardVault() {
  useEffect(() => {
    void clearVault().catch(() => {
      // Vault wipe is best-effort; blank store card remains either way.
    })
  }, [])
}
