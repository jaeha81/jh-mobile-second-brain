export const DB_NAME = 'mobile-second-brain'
export const DB_VERSION = 1
export const CONSENT_VERSION = '1.0'

export const STORES = {
  CONSENT: 'consent',
  SETTINGS: 'settings',
  EVENTS: 'events',
  MEMOS: 'memos',
  AUDIO_SESSIONS: 'audioSessions',
  AUDIO_BLOBS: 'audioBlobs',
  SYNC_QUEUE: 'syncQueue',
  SYNC_LOGS: 'syncLogs',
  ERROR_LOGS: 'errorLogs',
} as const

export const DEFAULT_SETTINGS = {
  autoSync: false,
  uploadAudioToGithub: false, // 기본 off
  githubOwner: '',
  githubRepo: '',
  githubBranch: 'main',
  githubBasePath: 'obsidian-vault',
}

export const SENSITIVE_INPUT_TYPES = ['password', 'email', 'tel', 'credit-card']
export const SENSITIVE_PATTERNS = [
  /\d{6,}/,            // 인증번호
  /[A-Za-z0-9+/]{40,}/, // 토큰 형태
  /sk-[A-Za-z0-9]+/,  // API 키
  /ghp_[A-Za-z0-9]+/, // GitHub token
]

export const MAX_NOTE_LENGTH = 500
export const MAX_MEMO_LENGTH = 2000
export const MAX_ERROR_LOGS = 100
export const MAX_SYNC_ATTEMPTS = 3
