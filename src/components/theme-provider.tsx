'use client'

import * as React from 'react'

export type Theme = 'clouds' | 'kawaii' | 'nfactorial' | 'dark'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeProviderContext = React.createContext<ThemeProviderState>({
  theme: 'clouds',
  setTheme: () => null,
})

export function ThemeProvider({
  children,
  defaultTheme = 'clouds',
  storageKey = 'sudomind-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(storageKey) as Theme | null
    if (stored && ['clouds', 'kawaii', 'nfactorial', 'dark'].includes(stored)) {
      setThemeState(stored)
    }
  }, [storageKey])

  React.useEffect(() => {
    if (!mounted) return
    const root = window.document.documentElement
    root.removeAttribute('data-theme')
    root.classList.remove('dark')
    if (theme === 'dark') {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.setAttribute('data-theme', theme)
    }
    localStorage.setItem(storageKey, theme)
  }, [theme, mounted, storageKey])

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), [])
  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  if (!mounted) {
    return <div data-theme={defaultTheme}>{children}</div>
  }

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

export const themes: { value: Theme; label: string; description: string }[] = [
  { value: 'clouds', label: '☁️ Clouds', description: 'Soft glassmorphism' },
  { value: 'kawaii', label: '🌸 Kawaii', description: 'Cute pastel pink' },
  { value: 'nfactorial', label: '⚡ nFactorial', description: 'Clean & sharp' },
  { value: 'dark', label: '🌙 Dark Night', description: 'Neon on dark' },
]