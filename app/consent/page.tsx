'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ConsentPanel from '@/components/ConsentPanel'
import { hasFullConsent, saveConsent } from '@/lib/db'
import type { ConsentRecord } from '@/lib/types'

export default function ConsentPage() {
  const router = useRouter()
  const [alreadyConsented, setAlreadyConsented] = useState<boolean | null>(null)

  useEffect(() => {
    hasFullConsent().then(setAlreadyConsented)
  }, [])

  async function handleConsent(items: ConsentRecord['items']) {
    await saveConsent(items)
    router.push('/')
  }

  if (alreadyConsented === null) {
    return (
      <AppShell hideNav>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-[#444444] text-sm">로딩 중...</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="앱 사용 동의" hideNav>
      <div className="space-y-6 py-4">
        {alreadyConsented && (
          <div className="card border-green-800">
            <p className="text-sm text-green-400">✓ 이미 동의 완료. 재동의 가능합니다.</p>
          </div>
        )}
        <ConsentPanel onConsent={handleConsent} />
      </div>
    </AppShell>
  )
}
