'use client'

import { useTheme, themes, type Theme } from '@/components/theme-provider'
import { cn } from '@/lib/utils'

const themeColors: Record<Theme, string> = {
  clouds: 'bg-sky-100 text-sky-600 hover:bg-sky-200',
  kawaii: 'bg-pink-100 text-pink-500 hover:bg-pink-200',
  nfactorial: 'bg-red-100 text-red-600 hover:bg-red-200',
  dark: 'bg-slate-700 text-cyan-400 hover:bg-slate-600',
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  return (
    <div className={cn('inline-flex items-center gap-1 p-1 rounded-2xl glass', className)}>
      {themes.map((t) => (
        <button
          key={t.value}
          onClick={() => setTheme(t.value)}
          className={cn(
            'px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
            theme === t.value
              ? 'bg-primary text-primary-foreground shadow-sm scale-105'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
          title={t.description}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}