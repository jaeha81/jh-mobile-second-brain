'use client'
import { useEffect, useState } from 'react'
import AppShell from '@/components/AppShell'
import DailyPreview from '@/components/DailyPreview'
import SyncButton from '@/components/SyncButton'
import ErrorBanner from '@/components/ErrorBanner'
import { buildDailyData } from '@/lib/dailyBuilder'
import { todayString, toHHMM } from '@/lib/date'
import { getEventsByDate, getMemosByDate, getAudioSessionsByDate } from '@/lib/db'
import type { DailyBuildResult, AppEvent, QuickMemo, AudioSession } from '@/lib/types'

export default function DailyReviewPage() {
  const [daily, setDaily] = useState<DailyBuildResult | null>(null)
  const [events, setEvents] = useState<AppEvent[]>([])
  const [memos, setMemos] = useState<QuickMemo[]>([])
  const [audioSessions, setAudioSessions] = useState<AudioSession[]>([])
  const [error, setError] = useState('')
  const today = todayString()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    try {
      const [d, ev, mo, au] = await Promise.all([
        buildDailyData(today),
        getEventsByDate(today),
        getMemosByDate(today),
        getAudioSessionsByDate(today),
      ])
      setDaily(d)
      setEvents(ev)
      setMemos(mo)
      setAudioSessions(au)
    } catch (err) {
      setError('데이터 로드 실패')
    }
  }

  async function handleSync(): Promise<{ success: boolean; error?: string }> {
    if (!daily) return { success: false, error: '데이터 없음' }
    try {
      const res = await fetch('/api/github/sync-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          markdownContent: daily.markdown,
          eventsJsonl: daily.jsonl,
          audioSessionsJson: daily.audioSessionsJson,
          metadataJson: JSON.stringify(daily.metadata, null, 2),
        }),
      })
      const data = await res.json()
      if (data.success) await load()
      return data
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '동기화 실패' }
    }
  }

  return (
    <AppShell title="오늘 리뷰">
      <div className="space-y-4 pt-2">
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {/* 통계 */}
        <div className="card">
          <p className="label-sm mb-3">{today} 요약</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-[#666666] mt-1">이벤트</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{memos.length}</p>
              <p className="text-xs text-[#666666] mt-1">메모</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{audioSessions.length}</p>
              <p className="text-xs text-[#666666] mt-1">녹음</p>
            </div>
          </div>
        </div>

        {/* 메모 목록 */}
        {memos.length > 0 && (
          <div className="card space-y-3">
            <p className="label-sm">오늘 메모</p>
            {memos.map(m => (
              <div key={m.id} className="flex gap-2">
                <span className="text-xs text-[#444444] flex-shrink-0 mt-0.5">{toHHMM(m.createdAt)}</span>
                <p className="text-sm text-[#cccccc]">{m.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 타임라인 (최근 10개) */}
        {events.length > 0 && (
          <div className="card space-y-2">
            <p className="label-sm">활동 타임라인</p>
            {events.slice(-10).reverse().map(e => (
              <div key={e.id} className="flex gap-2 items-start">
                <span className="text-xs text-[#444444] flex-shrink-0 mt-0.5">{toHHMM(e.timestamp)}</span>
                <span className="text-xs text-[#888888]">{e.type}</span>
                {e.note && <span className="text-xs text-[#666666] truncate">— {e.note}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Markdown 미리보기 */}
        {daily && <DailyPreview markdown={daily.markdown} date={today} />}

        {/* 동기화 */}
        <SyncButton onSync={handleSync} />
      </div>
    </AppShell>
  )
}
