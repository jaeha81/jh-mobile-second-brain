// ─── Consent ─────────────────────────────────────────────────────────────────
export interface ConsentRecord {
  id: 'consent'
  version: string
  agreedAt: string
  items: {
    activityLogging: boolean
    voiceRecording: boolean
    githubSync: boolean
    sensitiveDataWarning: boolean
  }
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface AppSettings {
  id: 'settings'
  autoSync: boolean
  uploadAudioToGithub: boolean
  githubOwner: string
  githubRepo: string
  githubBranch: string
  githubBasePath: string
  updatedAt: string
}

// ─── Event Log ────────────────────────────────────────────────────────────────
export type EventType =
  | 'capture_start'
  | 'capture_stop'
  | 'button_click'
  | 'navigation'
  | 'memo'
  | 'recording_start'
  | 'recording_stop'
  | 'sync_start'
  | 'sync_success'
  | 'sync_fail'

export interface AppEvent {
  id: string
  timestamp: string
  type: EventType
  target: string
  page: string
  note: string
  sessionId: string
  deviceInfo: string
  consentVersion: string
}

// ─── Memo ─────────────────────────────────────────────────────────────────────
export interface QuickMemo {
  id: string
  content: string
  createdAt: string
  page: string
  sessionId: string
}

// ─── Audio Session ────────────────────────────────────────────────────────────
export interface AudioSession {
  sessionId: string
  date: string
  startedAt: string
  endedAt: string
  durationSec: number
  localSaved: boolean
  githubUploaded: boolean
  fileName: string
  mimeType: string
}

// ─── Audio Blob ───────────────────────────────────────────────────────────────
export interface AudioBlob {
  sessionId: string
  blob: Blob
  savedAt: string
}

// ─── Sync ─────────────────────────────────────────────────────────────────────
export type SyncStatus = 'pending' | 'success' | 'failed'

export interface SyncQueueItem {
  id: string
  date: string
  status: SyncStatus
  attempts: number
  lastAttemptAt: string
  error?: string
}

export interface SyncLog {
  id: string
  date: string
  syncedAt: string
  status: SyncStatus
  filesUploaded: string[]
  error?: string
}

// ─── Error Log ────────────────────────────────────────────────────────────────
export interface ErrorLog {
  id: string
  timestamp: string
  context: string
  message: string
  stack?: string
}

// ─── Daily Data ───────────────────────────────────────────────────────────────
export interface DailyMetadata {
  date: string
  generatedAt: string
  totalEvents: number
  totalMemos: number
  totalAudioSessions: number
  captureStartedAt: string | null
  captureEndedAt: string | null
  lastSyncedAt: string | null
  githubSyncStatus: SyncStatus | null
}

export interface DailyBuildResult {
  markdown: string
  jsonl: string
  audioSessionsJson: string
  metadata: DailyMetadata
}

// ─── GitHub API ───────────────────────────────────────────────────────────────
export interface GithubFilePayload {
  path: string
  content: string // base64
  message: string
  sha?: string
}

export interface SyncDailyPayload {
  date: string
  markdownContent: string
  eventsJsonl: string
  audioSessionsJson: string
  metadataJson: string
}

export interface GithubConfigStatus {
  configured: boolean
  repoAccessible: boolean
  error?: string
}
