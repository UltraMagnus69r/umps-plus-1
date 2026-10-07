import { useEffect, useState, type RefObject } from 'react'
import {
  downloadBlob,
  safeFilename,
} from '@/domain/export/png'
import type { ExportSizeMode } from '@/domain/export/render'
import { sizeLabel } from '@/domain/export/render'
import {
  blobToImage,
  chunkForSheets,
  composeBackSheet,
  composeFrontSheet,
  loadCardBackImage,
  sheetCanvasToPng,
} from '@/domain/export/sheets'
import {
  BLEED_PX,
  DPI,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TRIM_HEIGHT,
  TRIM_WIDTH,
} from '@/domain/geometry/constants'
import {
  SHEET_DPI,
  SHEET_SLOTS,
} from '@/domain/geometry/printSheet'
import type { CardStageHandle } from '@/renderer/CardStage'
import { useCardStore } from '@/store/cardStore'
import { usePrintQueue } from '@/store/printQueue'
import styles from '@/styles/shell.module.css'

type Props = {
  stageRef: RefObject<CardStageHandle | null>
}

type ExportTab = 'file' | 'print'

export function ExportPanel({ stageRef }: Props) {
  const card = useCardStore((s) => s.card)
  const resetCard = useCardStore((s) => s.resetCard)
  const [tab, setTab] = useState<ExportTab>('file')
  const [sizeMode, setSizeMode] = useState<ExportSizeMode>('bleed')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [includeBacks, setIncludeBacks] = useState(true)
  const [hasBackAsset, setHasBackAsset] = useState(false)

  const items = usePrintQueue((s) => s.items)
  const addItem = usePrintQueue((s) => s.addItem)
  const removeItem = usePrintQueue((s) => s.removeItem)
  const moveItem = usePrintQueue((s) => s.moveItem)
  const clearQueue = usePrintQueue((s) => s.clear)

  useEffect(() => {
    let cancelled = false
    void loadCardBackImage().then((img) => {
      if (!cancelled) setHasBackAsset(!!img)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const withBusy = async (label: string, fn: () => Promise<void>) => {
    setError(null)
    setBusy(label)
    try {
      await fn()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setBusy(null)
    }
  }

  const onExportFlat = () =>
    withBusy('Exporting PNG…', async () => {
      const handle = stageRef.current
      if (!handle) throw new Error('Stage not ready')
      const blob = await handle.exportFlattenedPng({
        sizeMode,
        transparent: false,
      })
      const suffix = sizeMode === 'bleed' ? 'bleed' : 'trim'
      downloadBlob(blob, `${safeFilename(card.name)}-${suffix}-600dpi.png`)
    })

  const onExportTransparent = () =>
    withBusy('Exporting transparent PNG…', async () => {
      const handle = stageRef.current
      if (!handle) throw new Error('Stage not ready')
      const blob = await handle.exportFlattenedPng({
        sizeMode,
        transparent: true,
      })
      const suffix = sizeMode === 'bleed' ? 'bleed' : 'trim'
      downloadBlob(blob, `${safeFilename(card.name)}-${suffix}-transparent.png`)
    })

  const onExportLayers = () =>
    withBusy('Building layer pack…', async () => {
      const handle = stageRef.current
      if (!handle) throw new Error('Stage not ready')
      const zip = await handle.exportLayerPackZip(sizeMode)
      const suffix = sizeMode === 'bleed' ? 'bleed' : 'trim'
      downloadBlob(zip, `${safeFilename(card.name)}-layers-${suffix}.zip`)
    })

  const onAddToQueue = () =>
    withBusy('Adding to print queue…', async () => {
      const handle = stageRef.current
      if (!handle) throw new Error('Stage not ready')
      // Queue stores trim, opaque print-ready faces for sheet placement.
      const blob = await handle.exportFlattenedPng({
        sizeMode: 'trim',
        transparent: false,
      })
      addItem({ name: card.name || 'Card', blob })
    })

  const onGenerateSheets = () =>
    withBusy('Composing print sheets…', async () => {
      if (items.length === 0) throw new Error('Print queue is empty')
      const pages = chunkForSheets(items)
      const backImage =
        includeBacks && hasBackAsset ? await loadCardBackImage() : null

      for (let page = 0; page < pages.length; page++) {
        const pageItems = pages[page]!
        const images = await Promise.all(
          pageItems.map(async (item) => {
            const img = await blobToImage(item.blob)
            return { image: img, width: img.naturalWidth, height: img.naturalHeight }
          }),
        )
        const front = composeFrontSheet(images)
        const frontPng = await sheetCanvasToPng(front)
        downloadBlob(frontPng, `umps-sheet-${page + 1}-front.png`)

        if (backImage) {
          const back = composeBackSheet(images.length, backImage)
          const backPng = await sheetCanvasToPng(back)
          downloadBlob(backPng, `umps-sheet-${page + 1}-back.png`)
        }
      }
    })

  return (
    <div className={styles.panelStack}>
      <div className={styles.exportTabs} role="tablist" aria-label="Export section">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'file'}
          className={tab === 'file' ? styles.exportTabActive : styles.exportTab}
          onClick={() => setTab('file')}
        >
          File
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'print'}
          className={tab === 'print' ? styles.exportTabActive : styles.exportTab}
          onClick={() => setTab('print')}
        >
          Print
        </button>
      </div>

      {tab === 'file' && (
        <>
          <p className={styles.muted}>
            Print-ready single file defaults to flattened PNG with pHYs {DPI} DPI.
            Bleed {STAGE_WIDTH}×{STAGE_HEIGHT} (bleed {BLEED_PX}px/side) or trim{' '}
            {TRIM_WIDTH}×{TRIM_HEIGHT}.
          </p>

          <fieldset className={styles.segField}>
            <legend>Size</legend>
            <div className={styles.segRow}>
              <button
                type="button"
                className={
                  sizeMode === 'bleed' ? styles.segActive : styles.segBtn
                }
                onClick={() => setSizeMode('bleed')}
              >
                Bleed ({sizeLabel('bleed')})
              </button>
              <button
                type="button"
                className={sizeMode === 'trim' ? styles.segActive : styles.segBtn}
                onClick={() => setSizeMode('trim')}
              >
                Trim ({sizeLabel('trim')})
              </button>
            </div>
          </fieldset>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!!busy}
              onClick={() => void onExportFlat()}
            >
              Export PNG
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={!!busy}
              onClick={() => void onExportTransparent()}
            >
              Transparent PNG
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={!!busy}
              onClick={() => void onExportLayers()}
            >
              Layer pack (ZIP)
            </button>
          </div>

          <p className={styles.muted}>
            Layer pack: lossless <code>art.png</code>, <code>frame.png</code>,{' '}
            <code>text.png</code> — no opaque backplate. Match the stage stack.
          </p>
        </>
      )}

      {tab === 'print' && (
        <>
          <p className={styles.muted}>
            Queue trimmed print-ready faces, then compose Letter landscape 8-up
            sheets @ {SHEET_DPI} DPI with cut marks ({SHEET_SLOTS}/page).
          </p>

          <div className={styles.buttonRow}>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={!!busy}
              onClick={() => void onAddToQueue()}
            >
              Add current card
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={!!busy || items.length === 0}
              onClick={() => void onGenerateSheets()}
            >
              Generate sheet{items.length > SHEET_SLOTS ? 's' : ''}
            </button>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={items.length === 0}
              onClick={clearQueue}
            >
              Clear queue
            </button>
          </div>

          {hasBackAsset && (
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                checked={includeBacks}
                onChange={(e) => setIncludeBacks(e.target.checked)}
              />
              <span>Include card-back sheet (duplex column mirror)</span>
            </label>
          )}

          {items.length === 0 ? (
            <p className={styles.muted}>Queue is empty. Add the current card to start.</p>
          ) : (
            <ul className={styles.queueList} aria-label="Print queue">
              {items.map((item, index) => (
                <li key={item.id} className={styles.queueItem}>
                  <img src={item.thumbUrl} alt="" className={styles.queueThumb} />
                  <div className={styles.queueMeta}>
                    <span className={styles.queueName}>
                      {index + 1}. {item.name}
                    </span>
                    <div className={styles.buttonRow}>
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        disabled={index === 0}
                        onClick={() => moveItem(item.id, -1)}
                        aria-label={`Move ${item.name} up`}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        disabled={index === items.length - 1}
                        onClick={() => moveItem(item.id, 1)}
                        aria-label={`Move ${item.name} down`}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className={styles.ghostBtn}
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {busy && <p className={styles.statusMsg}>{busy}</p>}
      {error && <p className={styles.statusError}>{error}</p>}

      <button type="button" className={styles.ghostBtn} onClick={resetCard}>
        Reset card
      </button>
    </div>
  )
}
