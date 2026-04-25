import { saveEvent, saveErrorLog, hasFullConsent } from './db'
import { isSensitiveTarget, sanitizeNote, sanitizeTargetName } from './privacyFilters'
import { generateId, nowISO } from './date'
import { CONSENT_VERSION } from './constants'
import type { AppEvent, EventType } from './types'

let _sessionId = ''
let _currentPage = '/'

export function initSession(): string {
  _sessionId = generateId('session')
  return _sessionId
}

export function setCurrentPage(page: string): void {
  _currentPage = page
}

export function getSessionId(): string {
  return _sessionId || initSession()
}

function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'server'
  const ua = navigator.userAgent
  const isMobile = /Mobile|Android|iPhone|iPad/.test(ua)
  return isMobile ? 'mobile' : 'desktop'
}

export async function logEvent(
  type: EventType,
  target: string,
  note = '',
  page?: string
): Promise<void> {
  try {
    const consented = await hasFullConsent()
    if (!consented) return

    const sanitizedNote = sanitizeNote(note)

    const event: AppEvent = {
      id: generateId('evt'),
      timestamp: nowISO(),
      type,
      target,
      page: page ?? _currentPage,
      note: sanitizedNote,
      sessionId: getSessionId(),
      deviceInfo: getDeviceInfo(),
      consentVersion: CONSENT_VERSION,
    }

    await saveEvent(event)
  } catch (err) {
    // 로깅 실패는 조용히 처리 (무한 루프 방지)
    console.warn('[eventLogger] save failed', err)
  }
}

export async function logClick(e: MouseEvent): Promise<void> {
  try {
    const target = e.target as HTMLElement | null
    if (!target) return
    if (isSensitiveTarget(target)) return // 민감 필드 클릭 무시

    const targetName = sanitizeTargetName(target, 'unknown')
    await logEvent('button_click', targetName)
  } catch (err) {
    console.warn('[eventLogger] click log failed', err)
  }
}

export async function logNavigation(path: string): Promise<void> {
  setCurrentPage(path)
  await logEvent('navigation', path, '', path)
}

export async function logMemo(content: string): Promise<void> {
  const sanitized = sanitizeNote(content)
  await logEvent('memo', 'quick-note', sanitized)
}

export async function logError(context: string, err: unknown): Promise<void> {
  try {
    const message = err instanceof Error ? err.message : String(err)
    const stack = err instanceof Error ? err.stack : undefined
    await saveErrorLog({
      id: generateId('err'),
      timestamp: nowISO(),
      context,
      message,
      stack,
    })
  } catch {
    // silent
  }
}
