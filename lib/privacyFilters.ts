import { SENSITIVE_PATTERNS, MAX_NOTE_LENGTH } from './constants'

/**
 * input[type=password] 등 민감 입력 필드 여부 확인
 */
export function isSensitiveTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false
  const el = target as HTMLInputElement
  if (el.tagName === 'INPUT') {
    const type = el.type?.toLowerCase()
    if (['password', 'hidden'].includes(type)) return true
  }
  const role = el.getAttribute('aria-label') ?? ''
  const name = (el as HTMLInputElement).name ?? ''
  const id = el.id ?? ''
  const sensitiveKeywords = ['password', 'token', 'secret', 'auth', 'pin', 'card']
  return sensitiveKeywords.some(kw =>
    role.toLowerCase().includes(kw) ||
    name.toLowerCase().includes(kw) ||
    id.toLowerCase().includes(kw)
  )
}

/**
 * 텍스트에서 민감정보 패턴 검사
 */
export function containsSensitivePattern(text: string): boolean {
  return SENSITIVE_PATTERNS.some(p => p.test(text))
}

/**
 * 노트/메모 텍스트 정화 — 민감 패턴 마스킹
 */
export function sanitizeNote(text: string): string {
  let result = text.slice(0, MAX_NOTE_LENGTH)
  // GitHub token
  result = result.replace(/ghp_[A-Za-z0-9]{36,}/g, '[REDACTED_TOKEN]')
  // Generic API keys
  result = result.replace(/sk-[A-Za-z0-9]{32,}/g, '[REDACTED_KEY]')
  // Long base64-like strings
  result = result.replace(/[A-Za-z0-9+/]{60,}={0,2}/g, '[REDACTED_DATA]')
  return result
}

/**
 * 이벤트 target 이름 정규화 — id/class 기반, 값 미포함
 */
export function sanitizeTargetName(el: HTMLElement | null, fallback: string): string {
  if (!el) return fallback
  if (el.id) return `#${el.id}`
  if (el.getAttribute('data-track')) return el.getAttribute('data-track')!
  if (el.tagName === 'BUTTON') return `btn:${el.textContent?.trim().slice(0, 20) ?? fallback}`
  return fallback
}
