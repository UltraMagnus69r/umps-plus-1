/**
 * Letter print-sheet geometry — 8-up (KEEP legacy), landscape US Letter @ 300 DPI.
 * See docs/architecture/print-sheets.md for why not 3×3.
 */

import { TRIM_HEIGHT, TRIM_WIDTH } from '@/domain/geometry/constants'

/** Sheet compose DPI (lighter than card stage 600; still print-usable). */
export const SHEET_DPI = 300

/** US Letter landscape inches. */
export const LETTER_WIDTH_IN = 11
export const LETTER_HEIGHT_IN = 8.5

export const SHEET_WIDTH = Math.round(LETTER_WIDTH_IN * SHEET_DPI) // 3300
export const SHEET_HEIGHT = Math.round(LETTER_HEIGHT_IN * SHEET_DPI) // 2550

/** Physical poker card trim on the sheet (2.5" × 3.5"). */
export const SHEET_CARD_WIDTH = Math.round(2.5 * SHEET_DPI) // 750
export const SHEET_CARD_HEIGHT = Math.round(3.5 * SHEET_DPI) // 1050

/** 4×2 = 8-up landscape. */
export const SHEET_COLS = 4
export const SHEET_ROWS = 2
export const SHEET_SLOTS = SHEET_COLS * SHEET_ROWS // 8

/** Outer page margin before first cut mark / card edge. */
export const SHEET_MARGIN = Math.round(0.25 * SHEET_DPI) // 75

/** Gutter between cards (room for cut marks). */
export const SHEET_GUTTER_X =
  (SHEET_WIDTH - 2 * SHEET_MARGIN - SHEET_COLS * SHEET_CARD_WIDTH) /
  (SHEET_COLS - 1)
export const SHEET_GUTTER_Y =
  (SHEET_HEIGHT - 2 * SHEET_MARGIN - SHEET_ROWS * SHEET_CARD_HEIGHT) /
  (SHEET_ROWS - 1)

export const CUT_MARK_LEN = Math.round(0.12 * SHEET_DPI) // ~36
export const CUT_MARK_GAP = Math.round(0.04 * SHEET_DPI) // ~12
export const CUT_MARK_STROKE = 2

/** Source card pixels when placing a trim-sized export onto the sheet. */
export const SHEET_SOURCE_TRIM = {
  width: TRIM_WIDTH,
  height: TRIM_HEIGHT,
} as const

export function sheetSlotOrigin(index: number): { x: number; y: number } {
  const col = index % SHEET_COLS
  const row = Math.floor(index / SHEET_COLS)
  return {
    x: SHEET_MARGIN + col * (SHEET_CARD_WIDTH + SHEET_GUTTER_X),
    y: SHEET_MARGIN + row * (SHEET_CARD_HEIGHT + SHEET_GUTTER_Y),
  }
}

/** Duplex back order: mirror columns within each row. */
export function duplexBackIndex(frontIndex: number): number {
  const col = frontIndex % SHEET_COLS
  const row = Math.floor(frontIndex / SHEET_COLS)
  const mirroredCol = SHEET_COLS - 1 - col
  return row * SHEET_COLS + mirroredCol
}
