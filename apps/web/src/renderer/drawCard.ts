import type { CardDocument } from '@/domain/card/document'
import {
  BLEED_PX,
  STAGE_HEIGHT,
  STAGE_WIDTH,
  TRIM_CORNER_RADIUS_PX,
  TRIM_HEIGHT,
  TRIM_WIDTH,
} from '@/domain/geometry/constants'
import { SLOTS, type StageRect } from '@/domain/layout/slots'

export type DrawOptions = {
  showGuides?: boolean
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const paragraphs = text.replace(/\r\n/g, '\n').split('\n')
  const lines: string[] = []
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('')
      continue
    }
    const words = paragraph.split(/\s+/)
    let current = ''
    for (const word of words) {
      const next = current ? `${current} ${word}` : word
      if (ctx.measureText(next).width <= maxWidth) {
        current = next
      } else {
        if (current) lines.push(current)
        current = word
      }
    }
    if (current) lines.push(current)
  }
  return lines
}

function drawTextInBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  box: StageRect,
  opts: {
    font: string
    color: string
    align?: CanvasTextAlign
    lineHeight?: number
    paddingX?: number
    paddingY?: number
    valign?: 'top' | 'middle'
  },
): void {
  const padX = opts.paddingX ?? 28
  const padY = opts.paddingY ?? 28
  const lineHeight = opts.lineHeight ?? 52
  ctx.save()
  ctx.fillStyle = opts.color
  ctx.font = opts.font
  ctx.textAlign = opts.align ?? 'left'
  ctx.textBaseline = 'top'
  const maxWidth = Math.max(1, box.width - padX * 2)
  const lines = wrapLines(ctx, text, maxWidth)
  const blockHeight = lines.length * lineHeight
  let y =
    opts.valign === 'middle'
      ? box.y + (box.height - blockHeight) / 2
      : box.y + padY
  const x =
    opts.align === 'right'
      ? box.x + box.width - padX
      : opts.align === 'center'
        ? box.x + box.width / 2
        : box.x + padX
  for (const line of lines) {
    ctx.fillText(line, x, y, maxWidth)
    y += lineHeight
  }
  ctx.restore()
}

function drawArt(
  ctx: CanvasRenderingContext2D,
  card: CardDocument,
  image: HTMLImageElement | null,
): void {
  const box = SLOTS.artBox
  ctx.save()
  ctx.beginPath()
  ctx.rect(box.x, box.y, box.width, box.height)
  ctx.clip()
  ctx.fillStyle = '#2a3036'
  ctx.fillRect(box.x, box.y, box.width, box.height)

  if (image && image.complete && image.naturalWidth > 0) {
    const coverScale = Math.max(
      box.width / image.naturalWidth,
      box.height / image.naturalHeight,
    )
    const scale = coverScale * card.art.scale
    const w = image.naturalWidth * scale
    const h = image.naturalHeight * scale
    const x = box.x + (box.width - w) / 2 + card.art.offsetX
    const y = box.y + (box.height - h) / 2 + card.art.offsetY
    ctx.drawImage(image, x, y, w, h)
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.font = '500 48px "IBM Plex Sans", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Art', box.x + box.width / 2, box.y + box.height / 2)
  }
  ctx.restore()

  ctx.strokeStyle = 'rgba(40, 36, 30, 0.55)'
  ctx.lineWidth = 4
  ctx.strokeRect(box.x + 2, box.y + 2, box.width - 4, box.height - 4)
}

/** Draw the full-bleed card into a canvas context at stage resolution. */
export function drawCard(
  ctx: CanvasRenderingContext2D,
  card: CardDocument,
  artImage: HTMLImageElement | null,
  opts: DrawOptions = {},
): void {
  ctx.save()
  ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)

  // Bleed fill
  ctx.fillStyle = '#0e1114'
  ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT)

  // Face with trim silhouette
  roundRect(ctx, BLEED_PX, BLEED_PX, TRIM_WIDTH, TRIM_HEIGHT, TRIM_CORNER_RADIUS_PX)
  ctx.fillStyle = card.faceColor
  ctx.fill()

  // Inner frame plate
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  roundRect(ctx, 128, 122, 1394, 1840, 36)
  ctx.fill()

  // Name / type bars
  ctx.fillStyle = 'rgba(248, 244, 236, 0.92)'
  roundRect(ctx, SLOTS.nameBar.x, SLOTS.nameBar.y, SLOTS.nameBar.width, SLOTS.nameBar.height, 40)
  ctx.fill()
  roundRect(
    ctx,
    SLOTS.typeLine.x,
    SLOTS.typeLine.y,
    SLOTS.typeLine.width,
    SLOTS.typeLine.height,
    40,
  )
  ctx.fill()

  // Rules plate
  ctx.fillStyle = 'rgba(248, 244, 236, 0.88)'
  ctx.fillRect(
    SLOTS.rulesText.x,
    SLOTS.rulesText.y,
    SLOTS.rulesText.width,
    SLOTS.rulesText.height,
  )

  drawArt(ctx, card, artImage)

  drawTextInBox(ctx, card.name, SLOTS.nameBar, {
    font: '600 64px "Source Serif 4", Georgia, serif',
    color: '#1b1a17',
    valign: 'middle',
    paddingX: 36,
  })

  if (card.mana.trim()) {
    drawTextInBox(ctx, card.mana, SLOTS.nameBar, {
      font: '600 52px "IBM Plex Sans", sans-serif',
      color: '#1b1a17',
      align: 'right',
      valign: 'middle',
      paddingX: 40,
    })
  }

  drawTextInBox(ctx, card.typeLine, SLOTS.typeLine, {
    font: '600 48px "Source Serif 4", Georgia, serif',
    color: '#1b1a17',
    valign: 'middle',
    paddingX: 36,
  })

  drawTextInBox(ctx, card.rules, SLOTS.rulesText, {
    font: '500 42px "Source Serif 4", Georgia, serif',
    color: '#1b1a17',
    lineHeight: 54,
    paddingX: 36,
    paddingY: 36,
  })

  const pt = [card.power, card.toughness].filter((v) => v.trim()).join(' / ')
  if (pt) {
    ctx.fillStyle = 'rgba(248, 244, 236, 0.96)'
    roundRect(ctx, SLOTS.ptBox.x, SLOTS.ptBox.y, SLOTS.ptBox.width, SLOTS.ptBox.height, 28)
    ctx.fill()
    drawTextInBox(ctx, pt, SLOTS.ptBox, {
      font: '600 56px "IBM Plex Sans", sans-serif',
      color: '#1b1a17',
      align: 'center',
      valign: 'middle',
      paddingX: 12,
    })
  }

  if (opts.showGuides) {
    ctx.save()
    ctx.strokeStyle = 'rgba(212, 160, 64, 0.85)'
    ctx.lineWidth = 3
    ctx.setLineDash([18, 14])
    ctx.strokeRect(BLEED_PX, BLEED_PX, TRIM_WIDTH, TRIM_HEIGHT)
    ctx.strokeStyle = 'rgba(120, 180, 200, 0.7)'
    ctx.strokeRect(BLEED_PX * 2, BLEED_PX * 2, TRIM_WIDTH - BLEED_PX * 2, TRIM_HEIGHT - BLEED_PX * 2)
    ctx.restore()
  }

  ctx.restore()
}
