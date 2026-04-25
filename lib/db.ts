import { openDB, IDBPDatabase } from 'idb'
import type {
  ConsentRecord, AppSettings, AppEvent, QuickMemo,
  AudioSession, AudioBlob, SyncQueueItem, SyncLog, ErrorLog,
} from './types'
import { DB_NAME, DB_VERSION, STORES, DEFAULT_SETTINGS, CONSENT_VERSION } from './constants'

type MSBSchema = {
  [STORES.CONSENT]: { key: string; value: ConsentRecord }
  [STORES.SETTINGS]: { key: string; value: AppSettings }
  [STORES.EVENTS]: { key: string; value: AppEvent; indexes: { by_timestamp: string; by_date: string } }
  [STORES.MEMOS]: { key: string; value: QuickMemo; indexes: { by_date: string } }
  [STORES.AUDIO_SESSIONS]: { key: string; value: AudioSession; indexes: { by_date: string } }
  [STORES.AUDIO_BLOBS]: { key: string; value: AudioBlob }
  [STORES.SYNC_QUEUE]: { key: string; value: SyncQueueItem; indexes: { by_status: string } }
  [STORES.SYNC_LOGS]: { key: string; value: SyncLog }
  [STORES.ERROR_LOGS]: { key: string; value: ErrorLog }
}

let _db: IDBPDatabase<MSBSchema> | null = null

export async function getDB(): Promise<IDBPDatabase<MSBSchema>> {
  if (_db) return _db
  _db = await openDB<MSBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // consent
      if (!db.objectStoreNames.contains(STORES.CONSENT)) {
        db.createObjectStore(STORES.CONSENT, { keyPath: 'id' })
      }
      // settings
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'id' })
      }
      // events
      if (!db.objectStoreNames.contains(STORES.EVENTS)) {
        const ev = db.createObjectStore(STORES.EVENTS, { keyPath: 'id' })
        ev.createIndex('by_timestamp', 'timestamp')
        ev.createIndex('by_date', 'timestamp')
      }
      // memos
      if (!db.objectStoreNames.contains(STORES.MEMOS)) {
        const m = db.createObjectStore(STORES.MEMOS, { keyPath: 'id' })
        m.createIndex('by_date', 'createdAt')
      }
      // audioSessions
      if (!db.objectStoreNames.contains(STORES.AUDIO_SESSIONS)) {
        const a = db.createObjectStore(STORES.AUDIO_SESSIONS, { keyPath: 'sessionId' })
        a.createIndex('by_date', 'date')
      }
      // audioBlobs
      if (!db.objectStoreNames.contains(STORES.AUDIO_BLOBS)) {
        db.createObjectStore(STORES.AUDIO_BLOBS, { keyPath: 'sessionId' })
      }
      // syncQueue
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const sq = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' })
        sq.createIndex('by_status', 'status')
      }
      // syncLogs
      if (!db.objectStoreNames.contains(STORES.SYNC_LOGS)) {
        db.createObjectStore(STORES.SYNC_LOGS, { keyPath: 'id' })
      }
      // errorLogs
      if (!db.objectStoreNames.contains(STORES.ERROR_LOGS)) {
        db.createObjectStore(STORES.ERROR_LOGS, { keyPath: 'id' })
      }
    },
  })
  return _db
}

// ─── Consent ──────────────────────────────────────────────────────────────────
export async function getConsent(): Promise<ConsentRecord | undefined> {
  const db = await getDB()
  return db.get(STORES.CONSENT, 'consent')
}

export async function saveConsent(items: ConsentRecord['items']): Promise<void> {
  const db = await getDB()
  await db.put(STORES.CONSENT, {
    id: 'consent',
    version: CONSENT_VERSION,
    agreedAt: new Date().toISOString(),
    items,
  })
}

export async function clearConsent(): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.CONSENT, 'consent')
}

export async function hasFullConsent(): Promise<boolean> {
  const consent = await getConsent()
  if (!consent) return false
  return (
    consent.items.activityLogging &&
    consent.items.voiceRecording &&
    consent.items.githubSync &&
    consent.items.sensitiveDataWarning
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export async function getSettings(): Promise<AppSettings> {
  const db = await getDB()
  const s = await db.get(STORES.SETTINGS, 'settings')
  if (s) return s
  return {
    id: 'settings',
    ...DEFAULT_SETTINGS,
    updatedAt: new Date().toISOString(),
  }
}

export async function saveSettings(partial: Partial<Omit<AppSettings, 'id'>>): Promise<void> {
  const db = await getDB()
  const current = await getSettings()
  await db.put(STORES.SETTINGS, {
    ...current,
    ...partial,
    id: 'settings',
    updatedAt: new Date().toISOString(),
  })
}

// ─── Events ───────────────────────────────────────────────────────────────────
export async function saveEvent(event: AppEvent): Promise<void> {
  const db = await getDB()
  await db.put(STORES.EVENTS, event)
}

export async function getEventsByDate(date: string): Promise<AppEvent[]> {
  const db = await getDB()
  const all = await db.getAll(STORES.EVENTS)
  return all.filter(e => e.timestamp.startsWith(date))
}

// ─── Memos ────────────────────────────────────────────────────────────────────
export async function saveMemo(memo: QuickMemo): Promise<void> {
  const db = await getDB()
  await db.put(STORES.MEMOS, memo)
}

export async function getMemosByDate(date: string): Promise<QuickMemo[]> {
  const db = await getDB()
  const all = await db.getAll(STORES.MEMOS)
  return all.filter(m => m.createdAt.startsWith(date))
}

// ─── Audio Sessions ───────────────────────────────────────────────────────────
export async function saveAudioSession(session: AudioSession): Promise<void> {
  const db = await getDB()
  await db.put(STORES.AUDIO_SESSIONS, session)
}

export async function getAudioSessionsByDate(date: string): Promise<AudioSession[]> {
  const db = await getDB()
  const all = await db.getAll(STORES.AUDIO_SESSIONS)
  return all.filter(s => s.date === date)
}

export async function updateAudioSession(sessionId: string, partial: Partial<AudioSession>): Promise<void> {
  const db = await getDB()
  const existing = await db.get(STORES.AUDIO_SESSIONS, sessionId)
  if (existing) {
    await db.put(STORES.AUDIO_SESSIONS, { ...existing, ...partial })
  }
}

// ─── Audio Blobs ──────────────────────────────────────────────────────────────
export async function saveAudioBlob(item: AudioBlob): Promise<void> {
  const db = await getDB()
  await db.put(STORES.AUDIO_BLOBS, item)
}

export async function getAudioBlob(sessionId: string): Promise<AudioBlob | undefined> {
  const db = await getDB()
  return db.get(STORES.AUDIO_BLOBS, sessionId)
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────
export async function upsertSyncQueue(item: SyncQueueItem): Promise<void> {
  const db = await getDB()
  await db.put(STORES.SYNC_QUEUE, item)
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB()
  const all = await db.getAll(STORES.SYNC_QUEUE)
  return all.filter(i => i.status === 'pending' || i.status === 'failed')
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.SYNC_QUEUE, id)
}

// ─── Sync Logs ────────────────────────────────────────────────────────────────
export async function saveSyncLog(log: SyncLog): Promise<void> {
  const db = await getDB()
  await db.put(STORES.SYNC_LOGS, log)
}

export async function getLatestSyncLog(): Promise<SyncLog | undefined> {
  const db = await getDB()
  const all = await db.getAll(STORES.SYNC_LOGS)
  if (!all.length) return undefined
  return all.sort((a, b) => b.syncedAt.localeCompare(a.syncedAt))[0]
}

// ─── Error Logs ───────────────────────────────────────────────────────────────
export async function saveErrorLog(log: ErrorLog): Promise<void> {
  const db = await getDB()
  await db.put(STORES.ERROR_LOGS, log)
  // MAX_ERROR_LOGS 초과 시 오래된 것 제거
  const all = await db.getAll(STORES.ERROR_LOGS)
  if (all.length > 100) {
    const sorted = all.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    const toDelete = sorted.slice(0, all.length - 100)
    for (const e of toDelete) {
      await db.delete(STORES.ERROR_LOGS, e.id)
    }
  }
}

export async function getErrorLogs(): Promise<ErrorLog[]> {
  const db = await getDB()
  const all = await db.getAll(STORES.ERROR_LOGS)
  return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
}

// ─── Local Data Clear ─────────────────────────────────────────────────────────
export async function clearAllLocalData(): Promise<void> {
  const db = await getDB()
  await db.clear(STORES.EVENTS)
  await db.clear(STORES.MEMOS)
  await db.clear(STORES.AUDIO_SESSIONS)
  await db.clear(STORES.AUDIO_BLOBS)
  await db.clear(STORES.SYNC_QUEUE)
  await db.clear(STORES.SYNC_LOGS)
  await db.clear(STORES.ERROR_LOGS)
}
