'use client'

interface CaptureControlsProps {
  isCapturing: boolean
  eventCount: number
  onStart: () => void
  onStop: () => void
  disabled?: boolean
}

export default function CaptureControls({
  isCapturing, eventCount, onStart, onStop, disabled
}: CaptureControlsProps) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <p className="label-sm">기록 상태</p>
        <span className={`flex items-center gap-2 text-sm font-medium ${isCapturing ? 'text-green-400' : 'text-[#666666]'}`}>
          <span className={`status-dot ${isCapturing ? 'bg-green-500 animate-pulse' : 'bg-[#444444]'}`} />
          {isCapturing ? '기록 중' : '정지'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-[#111111] rounded-xl p-3">
          <p className="text-2xl font-bold">{eventCount}</p>
          <p className="text-xs text-[#666666] mt-1">이벤트</p>
        </div>
        <div className="bg-[#111111] rounded-xl p-3">
          <p className="text-2xl font-bold">{isCapturing ? 'ON' : 'OFF'}</p>
          <p className="text-xs text-[#666666] mt-1">캡처</p>
        </div>
      </div>

      {!isCapturing ? (
        <button onClick={onStart} disabled={disabled} className="btn-primary disabled:opacity-30">
          기록 시작
        </button>
      ) : (
        <button onClick={onStop} className="btn-secondary">
          기록 정지
        </button>
      )}
    </div>
  )
}
