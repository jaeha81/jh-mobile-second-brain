'use client'
import { useState } from 'react'

interface SyncButtonProps {
  onSync: () => Promise<{ success: boolean; error?: string }>
  lastSyncedAt?: string
}

export default function SyncButton({ onSync, lastSyncedAt }: SyncButtonProps) {
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handle = async () => {
    setStatus('syncing')
    setErrorMsg('')
    const result = await onSync()
    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setErrorMsg(result.error ?? '알 수 없는 오류')
    }
  }

  const labels = {
    idle: '☁ GitHub 동기화',
    syncing: '⟳ 동기화 중...',
    success: '✓ 동기화 완료',
    error: '✕ 동기화 실패',
  }

  const colors = {
    idle: 'btn-secondary',
    syncing: 'btn-secondary opacity-60',
    success: 'w-full py-4 rounded-2xl font-semibold text-base border border-green-800 text-green-400',
    error: 'w-full py-4 rounded-2xl font-semibold text-base border border-red-800 text-red-400',
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handle}
        disabled={status === 'syncing'}
        className={colors[status]}
      >
        {labels[status]}
      </button>
      {lastSyncedAt && status === 'idle' && (
        <p className="text-xs text-[#444444] text-center">마지막: {new Date(lastSyncedAt).toLocaleString('ko-KR')}</p>
      )}
      {status === 'error' && errorMsg && (
        <p className="text-xs text-red-400 text-center">{errorMsg}</p>
      )}
    </div>
  )
}
