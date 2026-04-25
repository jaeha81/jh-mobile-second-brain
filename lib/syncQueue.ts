import { upsertSyncQueue, getPendingSyncItems, removeSyncQueueItem, saveSyncLog } from './db'
import { generateId, nowISO } from './date'
import { logError } from './eventLogger'
import { MAX_SYNC_ATTEMPTS } from './constants'
import type { SyncQueueItem } from './types'

export async function enqueueDateForSync(date: string): Promise<void> {
  const item: SyncQueueItem = {
    id: `sync-${date}`,
    date,
    status: 'pending',
    attempts: 0,
    lastAttemptAt: nowISO(),
  }
  await upsertSyncQueue(item)
}

export async function markSyncAttempt(id: string, error?: string): Promise<void> {
  const items = await getPendingSyncItems()
  const item = items.find(i => i.id === id)
  if (!item) return

  const attempts = item.attempts + 1
  await upsertSyncQueue({
    ...item,
    attempts,
    lastAttemptAt: nowISO(),
    status: attempts >= MAX_SYNC_ATTEMPTS ? 'failed' : 'failed',
    error,
  })
}

export async function markSyncSuccess(id: string, date: string, filesUploaded: string[]): Promise<void> {
  await removeSyncQueueItem(id)
  await saveSyncLog({
    id: generateId('synclog'),
    date,
    syncedAt: nowISO(),
    status: 'success',
    filesUploaded,
  })
}

export async function getRetryableItems(): Promise<SyncQueueItem[]> {
  const items = await getPendingSyncItems()
  return items.filter(i => i.attempts < MAX_SYNC_ATTEMPTS)
}
