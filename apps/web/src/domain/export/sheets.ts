import { PHYS_PPM_600DPI } from '@/domain/geometry/constants'
import {
  CUT_MARK_GAP,
  CUT_MARK_LEN,
  CUT_MARK_STROKE,
  duplexBackIndex,
  SHEET_CARD_HEIGHT,
  SHEET_CARD_WIDTH,
  SHEET_DPI,
  SHEET_HEIGHT,
  SHEET_SLOTS,
  SHEET_WIDTH,
  sheetSlotOrigin,
} from '@/domain/geometry/printSheet'
import { canvasToPngBlob, patchPngPhysDpi } from '@/domain/export/png'

const PHYS_PPM_SHEET = Math.round((SHEET_DPI / 600) * PHYS_PPM_600DPI)

export type SheetCardImage = {
  /** Trim or bleed card bitmap (drawn into the sheet slot). */
  image: CanvasImageSource
  width: number
  height: number
}

function drawCutMarks(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  ctx.save()
  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = CUT_MARK_STROKE
  ctx.lineCap = 'butt'

  const corners: Array<[number, number, number, number]> = [
    // corner x,y + outward unit (ox, oy)
    [x, y, -1, -1],
    [x + w, y, 1, -1],
    [x, y + h, -1, 1],
    [x + w, y + h, 1, 1],
  ]

  for (const [cx, cy, ox, oy] of corners) {
    // horizontal tick
    ctx.beginPath()
    ctx.moveTo(cx + ox * CUT_MARK_GAP, cy)
    ctx.lineTo(cx + ox * (CUT_MARK_GAP + CUT_MARK_LEN), cy)
    ctx.stroke()
    // vertical tick
    ctx.beginPath()
    ctx.moveTo(cx, cy + oy * CUT_MARK_GAP)
    ctx.lineTo(cx, cy + oy * (CUT_MARK_GAP + CUT_MARK_LEN))
    ctx.stroke()
  }
  ctx.restore()
}

function drawCardInSlot(
  ctx: CanvasRenderingContext2D,
  card: SheetCardImage,
  slotIndex: number,
): void {
  const { x, y } = sheetSlotOrigin(slotIndex)
  ctx.drawImage(card.image, 0, 0, card.width, card.height, x, y, SHEET_CARD_WIDTH, SHEET_CARD_HEIGHT)
  drawCutMarks(ctx, x, y, SHEET_CARD_WIDTH, SHEET_CARD_HEIGHT)
}

export function composeFrontSheet(cards: SheetCardImage[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = SHEET_WIDTH
  canvas.height = SHEET_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create sheet canvas')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT)

  const count = Math.min(cards.length, SHEET_SLOTS)
  for (let i = 0; i < count; i++) {
    drawCardInSlot(ctx, cards[i]!, i)
  }
  return canvas
}

export async function loadCardBackImage(
  url = '/assets/print/card-back.png',
): Promise<HTMLImageElement | null> {
  try {
    const img = new Image()
    img.decoding = 'async'
    const loaded = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('card-back load failed'))
    })
    img.src = url
    return await loaded
  } catch {
    return null
  }
}

export function composeBackSheet(
  frontCount: number,
  backImage: HTMLImageElement,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = SHEET_WIDTH
  canvas.height = SHEET_HEIGHT
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create back sheet canvas')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, SHEET_WIDTH, SHEET_HEIGHT)

  const count = Math.min(frontCount, SHEET_SLOTS)
  for (let frontIdx = 0; frontIdx < count; frontIdx++) {
    const backIdx = duplexBackIndex(frontIdx)
    const { x, y } = sheetSlotOrigin(backIdx)
    ctx.drawImage(
      backImage,
      0,
      0,
      backImage.naturalWidth,
      backImage.naturalHeight,
      x,
      y,
      SHEET_CARD_WIDTH,
      SHEET_CARD_HEIGHT,
    )
    drawCutMarks(ctx, x, y, SHEET_CARD_WIDTH, SHEET_CARD_HEIGHT)
  }
  return canvas
}

export async function sheetCanvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  const raw = await canvasToPngBlob(canvas)
  return patchPngPhysDpi(raw, { xPpm: PHYS_PPM_SHEET, yPpm: PHYS_PPM_SHEET, unit: 1 })
}

/** Chunk queue items into 8-up pages. */
export function chunkForSheets<T>(items: T[]): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += SHEET_SLOTS) {
    pages.push(items.slice(i, i + SHEET_SLOTS))
  }
  return pages
}

export async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.decoding = 'async'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('Image decode failed'))
      img.src = url
    })
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}
