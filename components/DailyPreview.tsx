'use client'

interface DailyPreviewProps {
  markdown: string
  date: string
}

export default function DailyPreview({ markdown, date }: DailyPreviewProps) {
  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="label-sm">일일 기록 미리보기</p>
        <span className="text-xs text-[#444444]">{date}</span>
      </div>
      <div className="bg-[#111111] rounded-xl p-3 max-h-64 overflow-y-auto">
        <pre className="text-xs text-[#aaaaaa] whitespace-pre-wrap font-mono leading-relaxed">
          {markdown || '데이터 없음'}
        </pre>
      </div>
    </div>
  )
}
