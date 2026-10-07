import type { ArtPlacement, CardDocument } from '@/domain/card/document'

const DB_NAME = 'umps-plus-1-vault'
const DB_VERSION = 1
const STORE = 'current'
const KEY = 'card'

export type VaultRecord = {
  /** Card fields without ephemeral object URLs. */
  document: Omit<CardDocument, 'artUrl'>
  artBlob: Blob | null
  savedAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
}

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
  })
}

export async function saveVault(
  card: CardDocument,
  artBlob: Blob | null,
): Promise<void> {
  const { artUrl: _drop, ...document } = card
  const record: VaultRecord = {
    document,
    artBlob,
    savedAt: Date.now(),
  }
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    await idbReq(tx.objectStore(STORE).put(record, KEY))
  } finally {
    db.close()
  }
}

export async function loadVault(): Promise<VaultRecord | null> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readonly')
    const value = await idbReq(tx.objectStore(STORE).get(KEY))
    return (value as VaultRecord | undefined) ?? null
  } finally {
    db.close()
  }
}

export async function clearVault(): Promise<void> {
  const db = await openDb()
  try {
    const tx = db.transaction(STORE, 'readwrite')
    await idbReq(tx.objectStore(STORE).delete(KEY))
  } finally {
    db.close()
  }
}

/** Fetch remote or blob art into a Blob for persistence. */
export async function blobFromArtUrl(url: string | null): Promise<Blob | null> {
  if (!url) return null
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}

export function recordToCard(record: VaultRecord): CardDocument {
  const artUrl = record.artBlob ? URL.createObjectURL(record.artBlob) : null
  return {
    ...record.document,
    art: { ...record.document.art } satisfies ArtPlacement,
    artUrl,
  }
}
