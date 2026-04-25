'use client'

interface StatusCardProps {
  label: string
  value: string | number
  status?: 'active' | 'idle' | 'error' | 'success' | 'warning'
  sub?: string
}

const STATUS_COLORS = {
  active: 'bg-green-500',
  idle: 'bg-[#444444]',
  error: 'bg-red-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
}

export default function StatusCard({ label, value, status = 'idle', sub }: StatusCardProps) {
  return (
    <div className="card flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="label-sm mb-1">{label}</p>
        <p className="font-semibold text-base truncate">{value}</p>
        {sub && <p className="text-xs text-[#666666] mt-0.5">{sub}</p>}
      </div>
      {status && (
        <span className={`status-dot flex-shrink-0 ${STATUS_COLORS[status]}`} />
      )}
    </div>
  )
}
