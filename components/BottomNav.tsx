'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: '홈', icon: '⊙' },
  { href: '/capture', label: '기록', icon: '◉' },
  { href: '/daily-review', label: '리뷰', icon: '◈' },
  { href: '/settings', label: '설정', icon: '⊛' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-panel border-t border-[#2a2a2a] flex pb-safe">
      {NAV_ITEMS.map(item => {
        const active = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              active ? 'text-white' : 'text-[#666666]'
            }`}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
