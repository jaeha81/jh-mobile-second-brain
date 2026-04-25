/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환 (로컬 시간 기준)
 */
export function todayString(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Date → YYYY/MM 경로 문자열
 */
export function toYearMonth(dateStr: string): { year: string; month: string } {
  const [year, month] = dateStr.split('-')
  return { year, month }
}

/**
 * ISO timestamp 생성
 */
export function nowISO(): string {
  return new Date().toISOString()
}

/**
 * HH:MM 형식
 */
export function toHHMM(isoString: string): string {
  const d = new Date(isoString)
  return d.toTimeString().slice(0, 5)
}

/**
 * 짧은 날짜 표시
 */
export function formatDateKorean(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${year}년 ${month}월 ${day}일`
}

/**
 * 지속 시간(초) → "X분 Y초"
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}초`
  return `${m}분 ${s}초`
}

/**
 * 유일한 ID 생성
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}
