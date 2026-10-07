/** Canonical M15-style slots in stage pixels (from legacy KEEP layout map numbers). */

export type StageRect = {
  x: number
  y: number
  width: number
  height: number
}

export const SLOTS = {
  nameBar: { x: 152, y: 163, width: 1346, height: 142 },
  artBox: { x: 181, y: 305, width: 1288, height: 945 },
  typeLine: { x: 152, y: 1250, width: 1346, height: 142 },
  rulesText: { x: 181, y: 1392, width: 1288, height: 591 },
  ptBox: { x: 1257, y: 1912, width: 241, height: 142 },
} as const satisfies Record<string, StageRect>
