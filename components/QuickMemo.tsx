'use client'
import { useState } from 'react'
import { MAX_MEMO_LENGTH } from '@/lib/constants'

interface QuickMemoProps {
  onSave: (content: string) => Promise<void>
}

export default function QuickMemo({ onSave }: QuickMemoProps) {
  const [text, setText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!text.trim() || saving) return
    setSaving(true)
    try {
      await onSave(text.trim())
      setText('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card space-y-3">
      <p className="label-sm">빠른 메모</p>
      <textarea
        className="w-full bg-[#111111] rounded-xl p-3 text-sm text-white resize-none border border-[#2a2a2a] focus:border-[#444444] outline-none"
        rows={3}
        placeholder="지금 떠오른 생각을 기록하세요..."
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={MAX_MEMO_LENGTH}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#444444]">{text.length}/{MAX_MEMO_LENGTH}</span>
        <button
          onClick={handleSave}
          disabled={!text.trim() || saving}
          className="px-5 py-2 rounded-xl bg-white text-black text-sm font-semibold disabled:opacity-30 active:scale-95 transition-transform"
        >
          {saved ? '저장됨 ✓' : saving ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  )
}
