import { saveAudioBlob, saveAudioSession } from './db'
import { logEvent, logError } from './eventLogger'
import { todayString, generateId, nowISO } from './date'
import type { AudioSession } from './types'

export type RecorderState = 'idle' | 'recording' | 'stopped'

export interface RecorderHandle {
  sessionId: string
  startedAt: string
  stop: () => Promise<AudioSession>
  getElapsedSec: () => number
}

/**
 * 마이크 권한 요청 — 사용자가 명시적으로 호출해야 함
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(t => t.stop())
    return true
  } catch {
    return false
  }
}

/**
 * 녹음 시작 — 반드시 사용자 gesture 안에서 호출
 */
export async function startRecording(): Promise<RecorderHandle> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm'

  const recorder = new MediaRecorder(stream, { mimeType })
  const chunks: Blob[] = []
  const sessionId = generateId('audio')
  const startedAt = nowISO()
  const startTime = Date.now()

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }

  recorder.start(1000) // 1초 단위로 데이터 수집

  await logEvent('recording_start', 'recorder', '', undefined)

  return {
    sessionId,
    startedAt,
    getElapsedSec: () => Math.floor((Date.now() - startTime) / 1000),
    stop: async (): Promise<AudioSession> => {
      return new Promise((resolve, reject) => {
        recorder.onstop = async () => {
          try {
            stream.getTracks().forEach(t => t.stop())

            const blob = new Blob(chunks, { type: mimeType })
            const endedAt = nowISO()
            const durationSec = Math.floor((Date.now() - startTime) / 1000)

            const date = todayString()
            const sessions = await import('./db').then(m => m.getAudioSessionsByDate(date))
            const sessionNum = String(sessions.length + 1).padStart(3, '0')
            const fileName = `session-${sessionNum}.webm`

            const session: AudioSession = {
              sessionId,
              date,
              startedAt,
              endedAt,
              durationSec,
              localSaved: true,
              githubUploaded: false,
              fileName,
              mimeType,
            }

            await saveAudioBlob({ sessionId, blob, savedAt: endedAt })
            await saveAudioSession(session)
            await logEvent('recording_stop', 'recorder', `duration:${durationSec}s`)

            resolve(session)
          } catch (err) {
            await logError('recorder.stop', err)
            reject(err)
          }
        }

        recorder.stop()
      })
    },
  }
}

/**
 * HTTPS 또는 localhost 환경인지 확인 (MediaRecorder 요구사항)
 */
export function isSecureContext(): boolean {
  if (typeof window === 'undefined') return false
  return window.isSecureContext
}

/**
 * MediaRecorder 지원 여부 확인
 */
export function isRecordingSupported(): boolean {
  return typeof window !== 'undefined' &&
    typeof MediaRecorder !== 'undefined' &&
    typeof navigator?.mediaDevices?.getUserMedia === 'function'
}
