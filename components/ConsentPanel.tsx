'use client'
import { useState } from 'react'
import type { ConsentRecord } from '@/lib/types'

interface ConsentPanelProps {
  onConsent: (items: ConsentRecord['items']) => void
}

export default function ConsentPanel({ onConsent }: ConsentPanelProps) {
  const [items, setItems] = useState({
    activityLogging: false,
    voiceRecording: false,
    githubSync: false,
    sensitiveDataWarning: false,
  })

  const allChecked = Object.values(items).every(Boolean)

  const toggle = (key: keyof typeof items) => {
    setItems(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6">
      {/* 안내 */}
      <div className="card space-y-3">
        <p className="label-sm">이 앱이 하는 것</p>
        <ul className="space-y-2 text-sm text-[#cccccc]">
          <li>✅ 웹앱 내부 활동(버튼 클릭, 페이지 이동, 메모) 기록</li>
          <li>✅ 사용자가 직접 누른 경우에만 음성 녹음</li>
          <li>✅ 기기 로컬(IndexedDB)에 먼저 저장</li>
          <li>✅ 사용자 설정 GitHub private repo에 동기화</li>
        </ul>
      </div>

      <div className="card space-y-3">
        <p className="label-sm">이 앱이 하지 않는 것</p>
        <ul className="space-y-2 text-sm text-[#666666]">
          <li>🚫 다른 앱, 카카오톡, 문자, 통화 감시</li>
          <li>🚫 외부 브라우저 활동 수집</li>
          <li>🚫 백그라운드 상시 녹음</li>
          <li>🚫 비밀번호·토큰 수집</li>
          <li>🚫 키로깅</li>
        </ul>
      </div>

      {/* 동의 체크박스 */}
      <div className="card space-y-4">
        <p className="label-sm">동의 항목</p>
        {[
          { key: 'activityLogging' as const, label: '웹앱 내부 활동 기록에 동의합니다' },
          { key: 'voiceRecording' as const, label: '명시적 음성 녹음 (버튼 직접 누름)에 동의합니다' },
          { key: 'githubSync' as const, label: 'GitHub private repo 저장에 동의합니다' },
          { key: 'sensitiveDataWarning' as const, label: '민감정보를 직접 입력하지 않겠습니다' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-start gap-3 cursor-pointer">
            <div
              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                items[key] ? 'bg-white border-white' : 'border-[#444444]'
              }`}
              onClick={() => toggle(key)}
            >
              {items[key] && <span className="text-black text-sm font-bold">✓</span>}
            </div>
            <span className="text-sm text-[#cccccc] leading-relaxed">{label}</span>
          </label>
        ))}
      </div>

      <button
        className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
        disabled={!allChecked}
        onClick={() => allChecked && onConsent(items)}
      >
        동의하고 시작하기
      </button>
    </div>
  )
}
