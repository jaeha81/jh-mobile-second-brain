'use client'
import { useState, useEffect, useRef } from 'react'
import { startRecording, isRecordingSupported, isSecureContext } from '@/lib/recorder'
import { formatDuration } from '@/lib/date'
import type { RecorderHandle } from '@/lib/recorder'
import type { AudioSession } from '@/lib/types'

interface RecorderControlsProps {
  disabled?: boolean
  onSessionSaved?: (session: AudioSession) => void
}

export default function RecorderControls({ disabled, onSessionSaved }: RecorderControlsProps) {
  const [state, setState] = useState<'idle' | 'recording'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const handleRef = useRef<RecorderHandle | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!isRecordingSupported()) {
    return (
      <div className="card">
        <p className="text-sm text-[#666666]">이 브라우저에서는 녹음을 지원하지 않습니다.</p>
      </div>
    )
  }

  if (!isSecureContext()) {
    return (
      <div className="card">
        <p className="text-sm text-yellow-400">⚠ HTTPS 환경에서만 녹음이 가능합니다.</p>
      </div>
    )
  }

  const handleStart = async () => {
    setError('')
    try {
      const handle = await startRecording()
      handleRef.current = handle
      setState('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => {
        setElapsed(handle.getElapsedSec())
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : '녹음 시작 실패')
    }
  }

  const handleStop = async () => {
    if (!handleRef.current) return
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      const session = await handleRef.current.stop()
      handleRef.current = null
      setState('idle')
      setElapsed(0)
      onSessionSaved?.(session)
    } catch (err) {
      setError(err instanceof Error ? err.message : '녹음 저장 실패')
      setState('idle')
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-sm">음성 녹음</p>
        {state === 'recording' && (
          <span className="flex items-center gap-2 text-sm text-red-400">
            <span className="status-dot bg-red-500 animate-pulse" />
            {formatDuration(elapsed)}
          </span>
        )}
      </div>

      {state === 'idle' ? (
        <button
          onClick={handleStart}
          disabled={disabled}
          className="btn-secondary disabled:opacity-30"
        >
          🎙 녹음 시작
        </button>
      ) : (
        <button
          onClick={handleStop}
          className="btn-danger"
        >
          ⏹ 녹음 정지
        </button>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-[#444444]">녹음은 로컬에만 저장됩니다. 업로드는 설정에서 켤 수 있습니다.</p>
    </div>
  )
}
