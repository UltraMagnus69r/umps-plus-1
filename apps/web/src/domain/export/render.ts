import {
  BLEED_PX,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TRIM_HEIGHT,
  TRIM_WIDTH,
} from '@/domain/geometry/constants'
import type { CardDocument } from '@/domain/card/document'
import {
  CARD_LAYER_IDS,
  drawCard,
  drawCardLayer,
  type CardLayerId,
  type DrawOptions,
} from '@/renderer/drawCard'
import { canvasToPngBlob, exportCanvasPng600Dpi, patchPngPhysDpi } from '@/domain/export/png'
import { zipToBlob } from '@/domain/export/zip'

export type ExportSizeMode = 'bleed' | 'trim'

export type FlattenExportOptions = {
  sizeMode: ExportSizeMode
  /** Transparent flatten (no opaque bleed backplate). Default false. */
  transparent?: boolean
}

function cropToTrim(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = TRIM_WIDTH
  out.height = TRIM_HEIGHT
  const ctx = out.getContext('2d')
  if (!ctx) throw new Error('Could not create trim canvas')
  ctx.drawImage(
    source,
    BLEED_PX,
    BLEED_PX,
    TRIM_WIDTH,
    TRIM_HEIGHT,
    0,
    0,
    TRIM_WIDTH,
    TRIM_HEIGHT,
  )
  return out
}

export function sizeLabel(mode: ExportSizeMode): string {
  return mode === 'bleed'
    ? `${STAGE_WIDTH}×${STAGE_HEIGHT}`
    : `${TRIM_WIDTH}×${TRIM_HEIGHT}`
}

export function renderCardCanvas(
  card: CardDocument,
  artImage: HTMLImageElement | null,
  opts: FlattenExportOptions & DrawOptions = { sizeMode: 'bleed' },
): HTMLCanvasElement {
  const full = document.createElement('canvas')
  full.width = STAGE_WIDTH
  full.height = STAGE_HEIGHT
  const ctx = full.getContext('2d')
  if (!ctx) throw new Error('Could not create export canvas')
  drawCard(ctx, card, artImage, {
    showGuides: false,
    transparent: opts.transparent === true,
  })
  return opts.sizeMode === 'trim' ? cropToTrim(full) : full
}

export function renderLayerCanvas(
  card: CardDocument,
  artImage: HTMLImageElement | null,
  layer: CardLayerId,
  sizeMode: ExportSizeMode,
): HTMLCanvasElement {
  const full = document.createElement('canvas')
  full.width = STAGE_WIDTH
  full.height = STAGE_HEIGHT
  const ctx = full.getContext('2d')
  if (!ctx) throw new Error('Could not create layer canvas')
  drawCardLayer(ctx, card, artImage, layer, { transparent: true })
  return sizeMode === 'trim' ? cropToTrim(full) : full
}

export async function exportFlattenedPng(
  card: CardDocument,
  artImage: HTMLImageElement | null,
  opts: FlattenExportOptions,
): Promise<Blob> {
  const canvas = renderCardCanvas(card, artImage, opts)
  return exportCanvasPng600Dpi(canvas)
}

export async function exportLayerPackZip(
  card: CardDocument,
  artImage: HTMLImageElement | null,
  sizeMode: ExportSizeMode,
): Promise<Blob> {
  const entries = []
  for (const layer of CARD_LAYER_IDS) {
    const canvas = renderLayerCanvas(card, artImage, layer, sizeMode)
    const raw = await canvasToPngBlob(canvas)
    const png = await patchPngPhysDpi(raw)
    const bytes = new Uint8Array(await png.arrayBuffer())
    entries.push({ name: `${layer}.png`, data: bytes })
  }
  return zipToBlob(entries)
}

export { CARD_LAYER_IDS }
export type { CardLayerId }
