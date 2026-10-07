import { useRef, type ReactNode, type RefObject } from 'react'
import { ExportPanel } from '@/features/editor/ExportPanel'
import { ScryfallPanel } from '@/features/scryfall/ScryfallPanel'
import type { CardStageHandle } from '@/renderer/CardStage'
import { useCardStore, type EditorMode } from '@/store/cardStore'
import styles from '@/styles/shell.module.css'

type Props = {
  stageRef: RefObject<CardStageHandle | null>
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className={styles.field}>
      <span>{label}</span>
      {children}
    </label>
  )
}

function EditPanel() {
  const card = useCardStore((s) => s.card)
  const patchCard = useCardStore((s) => s.patchCard)

  return (
    <div className={styles.panelStack}>
      <Field label="Name">
        <input
          value={card.name}
          onChange={(e) => patchCard({ name: e.target.value })}
          autoComplete="off"
        />
      </Field>
      <Field label="Mana">
        <input
          value={card.mana}
          onChange={(e) => patchCard({ mana: e.target.value })}
          placeholder="e.g. 2G"
          autoComplete="off"
        />
      </Field>
      <Field label="Type line">
        <input
          value={card.typeLine}
          onChange={(e) => patchCard({ typeLine: e.target.value })}
          autoComplete="off"
        />
      </Field>
      <Field label="Rules">
        <textarea
          value={card.rules}
          onChange={(e) => patchCard({ rules: e.target.value })}
          rows={6}
        />
      </Field>
      <div className={styles.row2}>
        <Field label="Power">
          <input
            value={card.power}
            onChange={(e) => patchCard({ power: e.target.value })}
            autoComplete="off"
          />
        </Field>
        <Field label="Toughness">
          <input
            value={card.toughness}
            onChange={(e) => patchCard({ toughness: e.target.value })}
            autoComplete="off"
          />
        </Field>
      </div>
      <Field label="Face color">
        <input
          type="color"
          value={card.faceColor}
          onChange={(e) => patchCard({ faceColor: e.target.value })}
        />
      </Field>
    </div>
  )
}

function ArtPanel() {
  const card = useCardStore((s) => s.card)
  const patchArt = useCardStore((s) => s.patchArt)
  const setArtUrl = useCardStore((s) => s.setArtUrl)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className={styles.panelStack}>
      <div className={styles.buttonRow}>
        <button type="button" className={styles.primaryBtn} onClick={() => fileRef.current?.click()}>
          Upload art
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          disabled={!card.artUrl}
          onClick={() => setArtUrl(null)}
        >
          Clear
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            setArtUrl(URL.createObjectURL(file))
          }}
        />
      </div>
      <Field label={`Scale (${card.art.scale.toFixed(2)})`}>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.01}
          value={card.art.scale}
          onChange={(e) => patchArt({ scale: Number(e.target.value) })}
        />
      </Field>
      <Field label={`Offset X (${Math.round(card.art.offsetX)})`}>
        <input
          type="range"
          min={-600}
          max={600}
          step={1}
          value={card.art.offsetX}
          onChange={(e) => patchArt({ offsetX: Number(e.target.value) })}
        />
      </Field>
      <Field label={`Offset Y (${Math.round(card.art.offsetY)})`}>
        <input
          type="range"
          min={-600}
          max={600}
          step={1}
          value={card.art.offsetY}
          onChange={(e) => patchArt({ offsetY: Number(e.target.value) })}
        />
      </Field>
      <button
        type="button"
        className={styles.ghostBtn}
        onClick={() => patchArt({ offsetX: 0, offsetY: 0, scale: 1 })}
      >
        Reset placement
      </button>
    </div>
  )
}

const TITLES: Record<EditorMode, string> = {
  edit: 'Edit',
  art: 'Art',
  scryfall: 'Scryfall',
  export: 'Export',
}

export function Inspector({ stageRef }: Props) {
  const mode = useCardStore((s) => s.mode)
  const open = useCardStore((s) => s.inspectorOpen)
  const setInspectorOpen = useCardStore((s) => s.setInspectorOpen)

  return (
    <aside
      className={`${styles.inspector} ${open ? styles.inspectorOpen : ''}`}
      aria-label={`${TITLES[mode]} controls`}
    >
      <div className={styles.inspectorHead}>
        <h2>{TITLES[mode]}</h2>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => setInspectorOpen(false)}
          aria-label="Close controls"
        >
          Close
        </button>
      </div>
      <div className={styles.inspectorBody}>
        {mode === 'edit' && <EditPanel />}
        {mode === 'art' && <ArtPanel />}
        {mode === 'scryfall' && <ScryfallPanel />}
        {mode === 'export' && <ExportPanel stageRef={stageRef} />}
      </div>
    </aside>
  )
}
