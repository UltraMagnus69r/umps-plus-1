import { useEffect, useRef } from 'react'
import { Inspector } from '@/features/editor/Inspector'
import { CardStage, type CardStageHandle } from '@/renderer/CardStage'
import { useCardStore, type EditorMode } from '@/store/cardStore'
import styles from '@/styles/shell.module.css'

const MODES: { id: EditorMode; label: string }[] = [
  { id: 'edit', label: 'Edit' },
  { id: 'art', label: 'Art' },
  { id: 'export', label: 'Export' },
]

export function EditorShell() {
  const card = useCardStore((s) => s.card)
  const mode = useCardStore((s) => s.mode)
  const setMode = useCardStore((s) => s.setMode)
  const inspectorOpen = useCardStore((s) => s.inspectorOpen)
  const setInspectorOpen = useCardStore((s) => s.setInspectorOpen)
  const stageRef = useRef<CardStageHandle | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 960px)')
    const sync = () => setInspectorOpen(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [setInspectorOpen])

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brandBlock}>
          <span className={styles.brand}>UMPS+1</span>
          <span className={styles.brandSub}>Custom card</span>
        </div>
        <div className={styles.modeSeg} role="tablist" aria-label="Editor mode">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              className={mode === m.id ? styles.modeActive : styles.modeBtn}
              onClick={() => setMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.mobileToggle}
          onClick={() => setInspectorOpen(!inspectorOpen)}
          aria-expanded={inspectorOpen}
        >
          {inspectorOpen ? 'Hide' : 'Controls'}
        </button>
      </header>

      <main className={styles.main}>
        <section className={styles.stagePane} aria-label="Card stage">
          <CardStage card={card} stageRef={stageRef} showGuides={mode === 'export'} />
        </section>
        <Inspector stageRef={stageRef} />
      </main>

      {inspectorOpen && (
        <button
          type="button"
          className={styles.scrim}
          aria-label="Dismiss controls"
          onClick={() => setInspectorOpen(false)}
        />
      )}
    </div>
  )
}
