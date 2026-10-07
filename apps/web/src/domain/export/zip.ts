/** Minimal ZIP (STORE only) — PNGs are already compressed; no extra dep. */

function u16le(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >>> 8) & 0xff])
}

function u32le(n: number): Uint8Array {
  return new Uint8Array([
    n & 0xff,
    (n >>> 8) & 0xff,
    (n >>> 16) & 0xff,
    (n >>> 24) & 0xff,
  ])
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((s, p) => s + p.length, 0)
  const out = new Uint8Array(total)
  let o = 0
  for (const p of parts) {
    out.set(p, o)
    o += p.length
  }
  return out
}

function encodeUtf8(s: string): Uint8Array {
  return new TextEncoder().encode(s)
}

/** CRC-32 (ISO 3309 / PNG / ZIP). */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : c >>> 1
    }
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

export type ZipEntry = {
  name: string
  data: Uint8Array
}

export function buildZipStore(entries: ZipEntry[]): Uint8Array {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0

  for (const entry of entries) {
    const nameBytes = encodeUtf8(entry.name)
    const crc = crc32(entry.data)
    const size = entry.data.length
    const local = concat([
      u32le(0x04034b50),
      u16le(20),
      u16le(0),
      u16le(0), // STORE
      u16le(0),
      u16le(0),
      u32le(crc),
      u32le(size),
      u32le(size),
      u16le(nameBytes.length),
      u16le(0),
      nameBytes,
      entry.data,
    ])
    locals.push(local)

    const central = concat([
      u32le(0x02014b50),
      u16le(20),
      u16le(20),
      u16le(0),
      u16le(0),
      u16le(0),
      u16le(0),
      u32le(crc),
      u32le(size),
      u32le(size),
      u16le(nameBytes.length),
      u16le(0),
      u16le(0),
      u16le(0),
      u16le(0),
      u32le(0),
      u32le(offset),
      nameBytes,
    ])
    centrals.push(central)
    offset += local.length
  }

  const centralDir = concat(centrals)
  const end = concat([
    u32le(0x06054b50),
    u16le(0),
    u16le(0),
    u16le(entries.length),
    u16le(entries.length),
    u32le(centralDir.length),
    u32le(offset),
    u16le(0),
  ])

  return concat([...locals, centralDir, end])
}

export function zipToBlob(entries: ZipEntry[]): Blob {
  const bytes = buildZipStore(entries)
  const copy = new Uint8Array(bytes.byteLength)
  copy.set(bytes)
  return new Blob([copy.buffer], { type: 'application/zip' })
}
