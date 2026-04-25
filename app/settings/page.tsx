'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import SettingsForm from '@/components/SettingsForm'
import ErrorBanner from '@/components/ErrorBanner'
import { getSettings, saveSettings, clearConsent, clearAllLocalData } from '@/lib/db'
import type { AppSettings } from '@/lib/types'

export default function SettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  async function handleSave(partial: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>) {
    await saveSettings(partial)
    const updated = await getSettings()
    setSettings(updated)
    setMsg('설정이 저장되었습니다.')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleClearData() {
    if (!confirm('로컬 데이터를 전체 삭제합니다. 계속할까요?')) return
    await clearAllLocalData()
    setMsg('로컬 데이터가 삭제되었습니다.')
    setTimeout(() => setMsg(''), 2000)
  }

  async function handleResetConsent() {
    if (!confirm('동의를 초기화하면 기록 기능이 차단됩니다. 계속할까요?')) return
    await clearConsent()
    router.push('/consent')
  }

  async function handleCheckGithub(): Promise<{ ok: boolean; error?: string }> {
    try {
      const res = await fetch('/api/github/check-config')
      const data = await res.json()
      return { ok: data.repoAccessible, error: data.error }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : '요청 실패' }
    }
  }

  if (!settings) {
    return (
      <AppShell title="설정">
        <div className="flex items-center justify-center py-20">
          <p className="text-[#444444] text-sm">로딩 중...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="설정">
      <div className="space-y-4 pt-2">
        {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
        {msg && (
          <div className="card border-green-800">
            <p className="text-sm text-green-400">{msg}</p>
          </div>
        )}
        <SettingsForm
          settings={settings}
          onSave={handleSave}
          onClearData={handleClearData}
          onResetConsent={handleResetConsent}
          onCheckGithub={handleCheckGithub}
        />
      </div>
    </AppShell>
  )
}
