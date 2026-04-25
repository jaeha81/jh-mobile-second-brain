'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import CaptureControls from '@/components/CaptureControls'
import RecorderControls from '@/components/RecorderControls'
import QuickMemo from '@/components/QuickMemo'
import ErrorBanner from '@/components/ErrorBanner'
import { hasFullConsent, getEventsByDate, saveMemo } from '@/lib/db'
import { logEvent, logMemo, setCurrentPage } from '@/lib/eventLogger'
import { todayString, generateId, nowISO } from '@/lib/date'
import { sanitizeNote } from '@/lib/privacyFilters'
import type { AudioSession } from '@/lib/types'

export default function CapturePage() {
  const router = useRouter()
  const [consented, setConsented] = useState<boolean | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [eventCount, setEventCount] = useState(0)
  const [error, setError] = useState('')
  const today = todayString()

  useEffect(() => {
    setCurrentPage('/capture')
    loadState()
  }, [])

  async function loadState() {
    const ok = await hasFullConsent()
    setConsented(ok)
    if (ok) {
      const events = await getEventsByDate(today)
      setEventCount(events.length)
    }
  }

  const handleStart = useCallback(async () => {
    setIsCapturing(true)
    await logEvent('capture_start', 'start-button')
    setEventCount(c => c + 1)
  }, [])

  const handleStop = useCallback(async () => {
    setIsCapturing(false)
    await logEvent('capture_stop', 'stop-button')
    setEventCount(c => c + 1)
  }, [])

  const handleMemoSave = useCallback(async (content: string) => {
    const sanitized = sanitizeNote(content)
    await saveMemo({
      id: generateId('memo'),
      content: sanitized,
      createdAt: nowISO(),
      page: '/capture',
      sessionId: '',
    })
    await logMemo(sanitized)
    setEventCount(c => c + 1)
  }, [])

  const handleAudioSaved = useCallback(async (session: AudioSession) => {
    setEventCount(c => c + 1)
  }, [])

  if (consented === null) {
    return (
      <AppShell title="기록">
        <div className="flex items-center justify-center py-20">
          <p className="text-[#444444] text-sm">로딩 중...</p>
        </div>
      </AppShell>
    )
  }

  if (!consented) {
    return (
      <AppShell title="기록">
        <div className="space-y-4 pt-4">
          <div className="card border-yellow-800 bg-yellow-950 space-y-3">
            <p className="text-sm text-yellow-200">기록 기능을 사용하려면 동의가 필요합니다.</p>
            <button onClick={() => router.push('/consent')} className="btn-primary text-sm py-3">
              동의 화면으로
            </button>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="기록">
      <div className="space-y-4 pt-2">
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

        <CaptureControls
          isCapturing={isCapturing}
          eventCount={eventCount}
          onStart={handleStart}
          onStop={handleStop}
        />

        <RecorderControls
          disabled={!isCapturing}
          onSessionSaved={handleAudioSaved}
        />

        <QuickMemo onSave={handleMemoSave} />
      </div>
    </AppShell>
  )
}
