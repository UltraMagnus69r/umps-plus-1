import { useEffect, useRef, useState, type RefObject } from 'react'
import type { CardDocument } from '@/domain/card/document'
import { STAGE_HEIGHT, STAGE_WIDTH } from '@/domain/geometry/constants'
import { drawCard } from '@/renderer/drawCard'
import styles from '@/styles/shell.module.css'

export type CardStageHandle = {
  exportCanvas: () => HTMLCanvasElement
}

type Props = {
  card: CardDocument
  showGuides?: boolean
  stageRef?: RefObject<CardStageHandle | null>
}

export function CardStage({ card, showGuides = false, stageRef }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [artImage, setArtImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(0.25)

  useEffect(() => {
    if (!stageRef) return
    stageRef.current = {
      exportCanvas: () => {
        const exportCanvas = document.createElement('canvas')
        exportCanvas.width = STAGE_WIDTH
        exportCanvas.height = STAGE_HEIGHT
        const ctx = exportCanvas.getContext('2d')
        if (!ctx) throw new Error('Could not create export canvas')
        drawCard(ctx, card, artImage, { showGuides: false })
        return exportCanvas
      },
    }
    return () => {
      stageRef.current = null
    }
  }, [stageRef, card, artImage])

  useEffect(() => {
    if (!card.artUrl) {
      setArtImage(null)
      return
    }
    let cancelled = false
    const img = new Image()
    img.onload = () => {
      if (!cancelled) setArtImage(img)
    }
    img.onerror = () => {
      if (!cancelled) setArtImage(null)
    }
    img.src = card.artUrl
    return () => {
      cancelled = true
    }
  }, [card.artUrl])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      const next = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT)
      setScale(Math.max(0.08, next))
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    drawCard(ctx, card, artImage, { showGuides })
  }, [card, artImage, showGuides])

  return (
    <div className={styles.stageWell} ref={wrapRef}>
      <div
        className={styles.stageScaler}
        style={{
          width: STAGE_WIDTH * scale,
          height: STAGE_HEIGHT * scale,
        }}
      >
        <canvas
          ref={canvasRef}
          className={styles.stageCanvas}
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          style={{
            width: STAGE_WIDTH * scale,
            height: STAGE_HEIGHT * scale,
          }}
          aria-label="Card preview"
        />
      </div>
    </div>
  )
}
