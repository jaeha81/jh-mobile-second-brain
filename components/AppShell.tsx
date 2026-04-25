'use client'
import { ReactNode } from 'react'
import BottomNav from './BottomNav'

interface AppShellProps {
  children: ReactNode
  title?: string
  hideNav?: boolean
}

export default function AppShell({ children, title, hideNav }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto">
      {title && (
        <header className="px-4 pt-12 pb-4 flex items-center gap-3">
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        </header>
      )}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
