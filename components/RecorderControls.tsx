'use client'
import { useState, useEffect, useRef } from 'react'
import { startRecording, isRecordingSupported, isSecureContext } from '@/lib/recorder'
import { formatDuration } from '@/lib/date'
import { getSettings, getAudioBlob, updateAudioSession } from '@/lib/db'
import type { RecorderHandle } from '@/lib/recorder'
import type { AudioSession } from '@/lib/types'

interface RecorderControlsProps {
  disabled?: boolean
  onSessionSaved?: (session: AudioSession) => void
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function RecorderControls({ disabled, onSessionSaved }: RecorderControlsProps) {
  const [state, setState] = useState<'idle' | 'recording'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState('')
  const [uploadState, setUploadState] = useState<UploadState>('idle')
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
    setUploadState('idle')
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

      const settings = await getSettings()
      if (settings.uploadAudioToGithub) {
        setUploadState('uploading')
        try {
          const blobRecord = await getAudioBlob(session.sessionId)
          if (blobRecord?.blob) {
            const base64 = await blobToBase64(blobRecord.blob)
            const res = await fetch('/api/github/upload-audio', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: session.sessionId,
                date: session.date,
                fileName: session.fileName,
                audioBase64: base64,
                mimeType: session.mimeType,
              }),
            })
            const data = await res.json()
            if (data.success) {
              await updateAudioSession(session.sessionId, { githubUploaded: true })
              setUploadState('done')
            } else {
              setUploadState('error')
              setError(`업로드 실패: ${data.error}`)
            }
          } else {
            setUploadState('idle')
          }
        } catch (uploadErr) {
          setUploadState('error')
          setError(uploadErr instanceof Error ? uploadErr.message : '업로드 오류')
        }
      }
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

      {uploadState === 'uploading' && (
        <p className="text-xs text-blue-400">GitHub 업로드 중...</p>
      )}
      {uploadState === 'done' && (
        <p className="text-xs text-green-400">GitHub 업로드 완료</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <p className="text-xs text-[#444444]">녹음은 로컬에만 저장됩니다. 업로드는 설정에서 켤 수 있습니다.</p>
    </div>
  )
}
