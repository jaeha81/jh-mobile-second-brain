import { getEventsByDate, getMemosByDate, getAudioSessionsByDate } from './db'
import { todayString, toHHMM, formatDateKorean, nowISO } from './date'
import type { DailyBuildResult, DailyMetadata } from './types'

export async function buildDailyData(date?: string): Promise<DailyBuildResult> {
  const targetDate = date ?? todayString()

  const [events, memos, audioSessions] = await Promise.all([
    getEventsByDate(targetDate),
    getMemosByDate(targetDate),
    getAudioSessionsByDate(targetDate),
  ])

  // 타임라인 정렬
  events.sort((a, b) => a.timestamp.localeCompare(b.timestamp))

  const captureStart = events.find(e => e.type === 'capture_start')
  const captureEnd = events.filter(e => e.type === 'capture_stop').at(-1)
  const lastSync = events.filter(e => e.type === 'sync_success').at(-1)

  // ─── Markdown ─────────────────────────────────────────────────────────────
  const timelineLines = events.map(e => {
    const time = toHHMM(e.timestamp)
    const label = eventTypeLabel(e.type)
    const note = e.note ? ` — ${e.note}` : ''
    return `- \`${time}\` ${label}${note}`
  })

  const memoLines = memos.map(m => {
    const time = toHHMM(m.createdAt)
    return `- \`${time}\` ${m.content}`
  })

  const audioLines = audioSessions.length
    ? audioSessions.map((s, i) => {
        const num = String(i + 1).padStart(2, '0')
        const dur = formatDuration(s.durationSec)
        return `- 세션 ${num}: ${toHHMM(s.startedAt)} ~ ${toHHMM(s.endedAt)} (${dur}) | 로컬: ${s.localSaved ? '✅' : '❌'} | GitHub: ${s.githubUploaded ? '✅' : '❌'}`
      })
    : ['- 음성 기록 없음']

  const githubSyncStatus = lastSync ? '✅ 동기화 완료' : '⏳ 미동기화'

  const markdown = `# Daily Capture - ${targetDate}

## 1. 요약

- 기록 시작: ${captureStart ? toHHMM(captureStart.timestamp) : '-'}
- 기록 종료: ${captureEnd ? toHHMM(captureEnd.timestamp) : '-'}
- 총 이벤트 수: ${events.length}
- 메모 수: ${memos.length}
- 음성 세션 수: ${audioSessions.length}
- GitHub 동기화 상태: ${githubSyncStatus}
- 마지막 동기화 시간: ${lastSync ? toHHMM(lastSync.timestamp) : '-'}

## 2. 오늘의 핵심 메모

${memoLines.length ? memoLines.join('\n') : '- 메모 없음'}

## 3. 활동 타임라인

${timelineLines.length ? timelineLines.join('\n') : '- 활동 없음'}

## 4. 음성 기록

${audioLines.join('\n')}

## 5. 인사이트 후보

- 반복적으로 등장한 주제:
- 나중에 정리할 내용:
- 프로젝트로 분리할 내용:
- Obsidian 링크 후보:

## 6. 다음 액션

- [ ] 정리 필요
- [ ] 프로젝트 분리 필요
- [ ] 추가 메모 필요

## 7. 태그

#daily-capture #mobile-log #second-brain
`

  // ─── JSONL ─────────────────────────────────────────────────────────────────
  const jsonl = events
    .map(e => JSON.stringify({
      timestamp: e.timestamp,
      type: e.type,
      target: e.target,
      page: e.page,
      note: e.note,
      sessionId: e.sessionId,
      deviceInfo: e.deviceInfo,
      consentVersion: e.consentVersion,
    }))
    .join('\n')

  // ─── Audio Sessions JSON ──────────────────────────────────────────────────
  const audioSessionsJson = JSON.stringify(audioSessions, null, 2)

  // ─── Metadata ─────────────────────────────────────────────────────────────
  const metadata: DailyMetadata = {
    date: targetDate,
    generatedAt: nowISO(),
    totalEvents: events.length,
    totalMemos: memos.length,
    totalAudioSessions: audioSessions.length,
    captureStartedAt: captureStart?.timestamp ?? null,
    captureEndedAt: captureEnd?.timestamp ?? null,
    lastSyncedAt: lastSync?.timestamp ?? null,
    githubSyncStatus: lastSync ? 'success' : null,
  }

  return { markdown, jsonl, audioSessionsJson, metadata }
}

function eventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    capture_start: '📍 기록 시작',
    capture_stop: '⏹ 기록 정지',
    button_click: '👆 버튼 클릭',
    navigation: '🔀 페이지 이동',
    memo: '✏️ 메모 작성',
    recording_start: '🎙 녹음 시작',
    recording_stop: '🎙 녹음 종료',
    sync_start: '🔄 동기화 시작',
    sync_success: '✅ 동기화 완료',
    sync_fail: '❌ 동기화 실패',
  }
  return labels[type] ?? type
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}분 ${s}초` : `${s}초`
}
