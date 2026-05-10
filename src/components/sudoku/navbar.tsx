'use client'

import { motion } from 'framer-motion'
import { Timer, Star, Menu, X, Home, Trophy, CalendarDays, Settings } from 'lucide-react'
import { Lives } from './lives'
import { BackToMenuButton } from './controls'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { useSudokuGame } from '@/hooks/useSudokuGame'
import { useState } from 'react'
import Link from 'next/link'

export function Navbar() {
  const { lives, maxLives, score, timer, status, formatTime, gameMode } = useSudokuGame()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isDev = gameMode === 'dev'

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-border/40 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: back + logo */}
          <div className="flex items-center gap-3">
            <BackToMenuButton />
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black">S</span>
              </div>
              <span className="font-bold hidden md:block">
                Sudo<span className="text-primary">mind</span>
              </span>
            </Link>
          </div>

          {/* Center: game stats */}
          {status === 'playing' && (
            <div className="flex items-center gap-3 md:gap-5">
              {gameMode !== 'zen' && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Timer className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono font-semibold">{formatTime(timer)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-semibold">{isDev ? `${score} XP` : score}</span>
              </div>
              {gameMode !== 'zen' && (
                <Lives lives={lives} maxLives={maxLives} />
              )}
              {gameMode === 'zen' && (
                <span className="text-sm text-blue-400 font-medium">∞ Zen Mode</span>
              )}
              {isDev && (
                <span className="text-xs font-mono text-red-500 font-bold hidden sm:block">
                  {'</>'}
                </span>
              )}
            </div>
          )}

          {/* Right: theme + hamburger */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl glass"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 py-3 space-y-2"
          >
            <ThemeSwitcher className="w-full justify-center" />
            <div className="grid grid-cols-3 gap-2 pt-2">
              <Link
                href="/dashboard"
                className="flex flex-col items-center gap-1 p-3 rounded-xl glass text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="flex flex-col items-center gap-1 p-3 rounded-xl glass text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="w-5 h-5" />
                Ranks
              </Link>
              <Link
                href="/daily"
                className="flex flex-col items-center gap-1 p-3 rounded-xl glass text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CalendarDays className="w-5 h-5" />
                Daily
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass border-t border-border/40 px-6 py-2 safe-area-pb">
          <div className="flex items-center justify-around">
            <Link href="/dashboard" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </Link>
            <Link href="/daily" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors">
              <CalendarDays className="w-5 h-5" />
              <span className="text-[10px]">Daily</span>
            </Link>
            <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors">
              <Trophy className="w-5 h-5" />
              <span className="text-[10px]">Ranks</span>
            </Link>
            <Link href="/auth/login" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-[10px]">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}