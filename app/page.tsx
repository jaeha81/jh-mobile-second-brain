'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import StatusCard from '@/components/StatusCard'
import SyncButton from '@/components/SyncButton'
import ErrorBanner from '@/components/ErrorBanner'
import { hasFullConsent, getEventsByDate, getAudioSessionsByDate, getLatestSyncLog, getSettings } from '@/lib/db'
import { buildDailyData } from '@/lib/dailyBuilder'
import { todayString } from '@/lib/date'
import { initSession } from '@/lib/eventLogger'

export default function HomePage() {
  const router = useRouter()
  const [consented, setConsented] = useState<boolean | null>(null)
  const [eventCount, setEventCount] = useState(0)
  const [audioCount, setAudioCount] = useState(0)
  const [lastSync, setLastSync] = useState<string | undefined>()
  const [error, setError] = useState('')
  const autoSyncAttempted = useRef(false)
  const today = todayString()

  useEffect(() => {
    initSession()
    loadStatus()
  }, [])

  async function loadStatus() {
    try {
      const [ok, events, sessions, syncLog, settings] = await Promise.all([
        hasFullConsent(),
        getEventsByDate(today),
        getAudioSessionsByDate(today),
        getLatestSyncLog(),
        getSettings(),
      ])
      setConsented(ok)
      setEventCount(events.length)
      setAudioCount(sessions.length)
      setLastSync(syncLog?.syncedAt)

      if (ok && settings.autoSync && events.length > 0 && !autoSyncAttempted.current) {
        const alreadySyncedToday = syncLog?.syncedAt?.startsWith(today)
        if (!alreadySyncedToday) {
          autoSyncAttempted.current = true
          performSync()
        }
      }
    } catch {
      setError('상태 로드 실패')
    }
  }

  async function performSync(): Promise<{ success: boolean; error?: string }> {
    try {
      const daily = await buildDailyData(today)
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
      if (data.success) {
        const syncLog = await import('@/lib/db').then(m => m.getLatestSyncLog())
        setLastSync(syncLog?.syncedAt)
      }
      return data
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : '동기화 실패' }
    }
  }

  async function handleSync(): Promise<{ success: boolean; error?: string }> {
    const result = await performSync()
    if (result.success) await loadStatus()
    return result
  }

  if (consented === null) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#444444] text-sm">로딩 중...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Second Brain">
      <div className="space-y-4 pt-2">
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        {!consented && (
          <div className="card border-yellow-800 bg-yellow-950 space-y-3">
            <p className="text-sm text-yellow-200">동의가 필요합니다</p>
            <button onClick={() => router.push('/consent')} className="btn-primary text-sm py-3">
              동의 화면으로 이동
            </button>
          </div>
        )}

        {/* 오늘 현황 */}
        <div className="grid grid-cols-2 gap-3">
          <StatusCard
            label="오늘 이벤트"
            value={eventCount}
            status={eventCount > 0 ? 'active' : 'idle'}
          />
          <StatusCard
            label="음성 세션"
            value={audioCount}
            status={audioCount > 0 ? 'active' : 'idle'}
          />
        </div>

        <StatusCard
          label="마지막 동기화"
          value={lastSync ? new Date(lastSync).toLocaleString('ko-KR') : '없음'}
          status={lastSync ? 'success' : 'idle'}
          sub={today}
        />

        {/* 네비게이션 */}
        <button onClick={() => router.push('/capture')} className="btn-primary">
          기록 화면으로
        </button>
        <button onClick={() => router.push('/daily-review')} className="btn-secondary">
          오늘 리뷰 보기
        </button>

        {consented && (
          <SyncButton onSync={handleSync} lastSyncedAt={lastSync} />
        )}
      </div>
    </AppShell>
  )
}
