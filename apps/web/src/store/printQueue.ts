import { create } from 'zustand'

export type PrintQueueItem = {
  id: string
  name: string
  /** Flattened print-ready PNG (trim, opaque). */
  blob: Blob
  thumbUrl: string
  addedAt: number
}

type PrintQueueState = {
  items: PrintQueueItem[]
  addItem: (item: Omit<PrintQueueItem, 'id' | 'addedAt' | 'thumbUrl'> & { thumbUrl?: string }) => void
  removeItem: (id: string) => void
  moveItem: (id: string, dir: -1 | 1) => void
  clear: () => void
}

function revokeThumb(item: PrintQueueItem): void {
  if (item.thumbUrl.startsWith('blob:')) URL.revokeObjectURL(item.thumbUrl)
}

export const usePrintQueue = create<PrintQueueState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const id = `pq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
    const thumbUrl = item.thumbUrl ?? URL.createObjectURL(item.blob)
    set({
      items: [
        ...get().items,
        {
          id,
          name: item.name,
          blob: item.blob,
          thumbUrl,
          addedAt: Date.now(),
        },
      ],
    })
  },
  removeItem: (id) => {
    const prev = get().items.find((i) => i.id === id)
    if (prev) revokeThumb(prev)
    set({ items: get().items.filter((i) => i.id !== id) })
  },
  moveItem: (id, dir) => {
    const items = [...get().items]
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) return
    const next = idx + dir
    if (next < 0 || next >= items.length) return
    const tmp = items[idx]!
    items[idx] = items[next]!
    items[next] = tmp
    set({ items })
  },
  clear: () => {
    for (const item of get().items) revokeThumb(item)
    set({ items: [] })
  },
}))
