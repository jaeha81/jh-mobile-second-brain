'use client'
import { useState } from 'react'
import type { AppSettings } from '@/lib/types'

interface SettingsFormProps {
  settings: AppSettings
  onSave: (partial: Partial<Omit<AppSettings, 'id' | 'updatedAt'>>) => Promise<void>
  onClearData: () => Promise<void>
  onResetConsent: () => Promise<void>
  onCheckGithub: () => Promise<{ ok: boolean; error?: string }>
}

export default function SettingsForm({
  settings, onSave, onClearData, onResetConsent, onCheckGithub
}: SettingsFormProps) {
  const [autoSync, setAutoSync] = useState(settings.autoSync)
  const [uploadAudio, setUploadAudio] = useState(settings.uploadAudioToGithub)
  const [githubStatus, setGithubStatus] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ autoSync, uploadAudioToGithub: uploadAudio })
    setSaving(false)
  }

  const handleCheck = async () => {
    setGithubStatus('확인 중...')
    const result = await onCheckGithub()
    setGithubStatus(result.ok ? '✅ 연결 성공' : `❌ ${result.error}`)
  }

  return (
    <div className="space-y-4">
      {/* GitHub 설정 (읽기 전용 — 서버 .env 관리) */}
      <div className="card space-y-3">
        <p className="label-sm">GitHub 설정</p>
        <InfoRow label="Owner" value={settings.githubOwner || '미설정 (.env.local 확인)'} />
        <InfoRow label="Repo" value={settings.githubRepo || '미설정'} />
        <InfoRow label="Branch" value={settings.githubBranch || 'main'} />
        <InfoRow label="Base Path" value={settings.githubBasePath || 'obsidian-vault'} />
        <p className="text-xs text-[#444444]">GitHub Token은 서버 .env.local에서만 관리됩니다.</p>
        <button onClick={handleCheck} className="btn-secondary text-sm py-3">
          GitHub 연결 확인
        </button>
        {githubStatus && <p className="text-xs text-[#aaaaaa]">{githubStatus}</p>}
      </div>

      {/* 동작 설정 */}
      <div className="card space-y-4">
        <p className="label-sm">동작 설정</p>
        <ToggleRow
          label="자동 동기화"
          sub="앱 실행 시 자동으로 GitHub에 동기화"
          value={autoSync}
          onChange={setAutoSync}
        />
        <ToggleRow
          label="오디오 원본 업로드"
          sub="기본 OFF — 켜면 webm 파일을 GitHub에 업로드"
          value={uploadAudio}
          onChange={setUploadAudio}
        />
        <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-3">
          {saving ? '저장 중...' : '설정 저장'}
        </button>
      </div>

      {/* 데이터 관리 */}
      <div className="card space-y-3">
        <p className="label-sm">데이터 관리</p>
        <button onClick={onResetConsent} className="btn-secondary text-sm py-3">
          동의 초기화
        </button>
        <button onClick={onClearData} className="btn-danger text-sm py-3">
          로컬 데이터 전체 삭제
        </button>
        <p className="text-xs text-[#444444]">삭제 후 복구 불가. GitHub에 동기화된 데이터는 유지됩니다.</p>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-[#666666]">{label}</span>
      <span className="text-xs text-[#aaaaaa] truncate max-w-[180px] text-right">{value}</span>
    </div>
  )
}

function ToggleRow({
  label, sub, value, onChange
}: {
  label: string; sub?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {sub && <p className="text-xs text-[#666666] mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-white' : 'bg-[#333333]'}`}
      >
        <span className={`block w-5 h-5 rounded-full bg-black transition-transform mx-0.5 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}
