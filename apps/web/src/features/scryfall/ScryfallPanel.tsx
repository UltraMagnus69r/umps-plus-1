import { useEffect, useId, useState, type FormEvent } from 'react'
import {
  mapScryfallToCard,
  preferredArtUrl,
  previewThumbUrl,
} from '@/features/scryfall/applyCard'
import { useCardStore } from '@/store/cardStore'
import {
  ScryfallError,
  scryfall,
  type ScryfallCard,
} from '@umps-plus-1/scryfall'
import styles from '@/styles/shell.module.css'

type Status =
  | { kind: 'idle' }
  | { kind: 'loading'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'empty'; message: string }

export function ScryfallPanel() {
  const formId = useId()
  const patchCard = useCardStore((s) => s.patchCard)
  const setArtUrl = useCardStore((s) => s.setArtUrl)

  const [query, setQuery] = useState('')
  const [setCode, setSetCode] = useState('')
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [prints, setPrints] = useState<ScryfallCard[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [resolvedName, setResolvedName] = useState<string | null>(null)

  useEffect(() => {
    setSelectedId(null)
  }, [prints])

  const onSearch = async (e: FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) {
      setStatus({ kind: 'empty', message: 'Enter a card name, SET 123, or Scryfall URL.' })
      setPrints([])
      setResolvedName(null)
      return
    }

    setStatus({ kind: 'loading', message: 'Looking up on Scryfall…' })
    setPrints([])
    setResolvedName(null)

    try {
      const card = await scryfall.resolve(q, {
        set: setCode.trim() || undefined,
      })
      setResolvedName(card.name)
      setStatus({ kind: 'loading', message: `Loading prints of ${card.name}…` })
      const list = await scryfall.printsFor(card)
      if (list.length === 0) {
        setPrints([card])
        setSelectedId(card.id)
        setStatus({ kind: 'idle' })
        return
      }
      setPrints(list)
      setSelectedId(card.id)
      setStatus({ kind: 'idle' })
    } catch (err) {
      setPrints([])
      setSelectedId(null)
      setResolvedName(null)
      setStatus({
        kind: 'error',
        message: messageForError(err),
      })
    }
  }

  const onApply = async () => {
    const card = prints.find((p) => p.id === selectedId) ?? prints[0]
    if (!card) {
      setStatus({ kind: 'empty', message: 'Search for a card first.' })
      return
    }

    setStatus({ kind: 'loading', message: 'Applying to card…' })
    try {
      patchCard(mapScryfallToCard(card))
      const art = preferredArtUrl(card)
      if (art) {
        const res = await fetch(art)
        if (!res.ok) throw new Error('Could not download art_crop.')
        const blob = await res.blob()
        setArtUrl(URL.createObjectURL(blob))
      } else {
        setArtUrl(null)
      }
      setStatus({ kind: 'idle' })
    } catch (err) {
      setStatus({
        kind: 'error',
        message:
          err instanceof Error ? err.message : 'Failed to apply Scryfall card.',
      })
    }
  }

  const selected = prints.find((p) => p.id === selectedId) ?? null

  return (
    <div className={styles.panelStack}>
      <p className={styles.muted}>
        Online only — queries Scryfall. Paste a card URL, <code>LEA 232</code>, or
        a fuzzy name. Optional set forces an exact print family.
      </p>

      <form className={styles.panelStack} onSubmit={(e) => void onSearch(e)}>
        <label className={styles.field} htmlFor={`${formId}-q`}>
          <span>Name / URL / SET number</span>
          <input
            id={`${formId}-q`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Lightning Bolt or mh2 281"
            autoComplete="off"
            enterKeyHint="search"
          />
        </label>
        <label className={styles.field} htmlFor={`${formId}-set`}>
          <span>Set code (optional)</span>
          <input
            id={`${formId}-set`}
            value={setCode}
            onChange={(e) => setSetCode(e.target.value)}
            placeholder="e.g. mh2"
            autoComplete="off"
          />
        </label>
        <div className={styles.buttonRow}>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={status.kind === 'loading'}
          >
            Search
          </button>
          <button
            type="button"
            className={styles.ghostBtn}
            disabled={prints.length === 0 || status.kind === 'loading'}
            onClick={() => void onApply()}
          >
            Apply to card
          </button>
        </div>
      </form>

      {status.kind === 'loading' && (
        <p className={styles.statusMsg} role="status">
          {status.message}
        </p>
      )}
      {status.kind === 'error' && (
        <p className={styles.statusError} role="alert">
          {status.message}
        </p>
      )}
      {status.kind === 'empty' && (
        <p className={styles.statusMsg} role="status">
          {status.message}
        </p>
      )}

      {prints.length === 0 && status.kind === 'idle' && (
        <p className={styles.muted}>
          No results yet. Try a name like “Sol Ring” or a Scryfall card link.
        </p>
      )}

      {prints.length > 0 && (
        <div className={styles.printBlock}>
          <div className={styles.printMeta}>
            <span>
              {resolvedName ?? selected?.name ?? 'Prints'}
              {' · '}
              {prints.length} print{prints.length === 1 ? '' : 's'}
            </span>
            {selected && (
              <span className={styles.printMetaDim}>
                {selected.set.toUpperCase()} #{selected.collector_number}
              </span>
            )}
          </div>
          <ul className={styles.printGrid} aria-label="Printings">
            {prints.map((p) => {
              const thumb = previewThumbUrl(p)
              const active = p.id === selectedId
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className={
                      active ? styles.printTileActive : styles.printTile
                    }
                    aria-pressed={active}
                    onClick={() => setSelectedId(p.id)}
                  >
                    {thumb ? (
                      <img src={thumb} alt="" loading="lazy" />
                    ) : (
                      <span className={styles.printFallback}>No image</span>
                    )}
                    <span className={styles.printLabel}>
                      {p.set.toUpperCase()} · {p.collector_number}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

function messageForError(err: unknown): string {
  if (err instanceof ScryfallError) {
    if (err.status === 404) return 'No card matched that lookup.'
    return err.message
  }
  if (err instanceof TypeError) {
    return 'Network error — Scryfall needs an internet connection.'
  }
  if (err instanceof Error) return err.message
  return 'Scryfall request failed.'
}
