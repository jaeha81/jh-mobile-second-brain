'use client'

interface ErrorBannerProps {
  message: string
  onDismiss?: () => void
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) return null
  return (
    <div className="flex items-start gap-3 bg-red-950 border border-red-800 rounded-2xl p-4">
      <span className="text-red-400 text-lg flex-shrink-0">⚠</span>
      <p className="text-sm text-red-200 flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 text-lg flex-shrink-0 active:opacity-60"
          aria-label="닫기"
        >
          ✕
        </button>
      )}
    </div>
  )
}
