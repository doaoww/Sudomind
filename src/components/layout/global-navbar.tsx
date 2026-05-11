'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Gamepad2, LayoutDashboard,
  Trophy, CalendarDays, Timer, Star,
} from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/layout/user-menu'
import { Lives } from '@/components/sudoku/lives'
import { cn } from '@/lib/utils'

interface GameStats {
  lives: number
  maxLives: number
  score: number
  timer: number
  status: string
  formatTime: (s: number) => string
  gameMode: string
}

interface GlobalNavbarProps {
  gameStats?: GameStats
}

const NAV_LINKS = [
  { href: '/game', label: 'Play', icon: <Gamepad2 className="w-4 h-4" /> },
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  { href: '/daily', label: 'Daily', icon: <CalendarDays className="w-4 h-4" /> },
]

const MOBILE_NAV = [
  { href: '/game', label: 'Play', icon: <Gamepad2 className="w-5 h-5" /> },
  { href: '/dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/leaderboard', label: 'Ranks', icon: <Trophy className="w-5 h-5" /> },
  { href: '/daily', label: 'Daily', icon: <CalendarDays className="w-5 h-5" /> },
]

export function GlobalNavbar({ gameStats }: GlobalNavbarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isGame = pathname.startsWith('/game') || pathname.startsWith('/daily')
  const showStats = gameStats && gameStats.status === 'playing'

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <nav className="glass border-b border-border/30 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">

          {/* LEFT: Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-black text-base">S</span>
            </div>
            <span className="font-black text-base hidden sm:block">
              Sudo<span className="text-primary">mind</span>
            </span>
          </Link>

          {/* CENTER: Nav links (desktop) OR game stats */}
          <div className="hidden md:flex items-center">
            {showStats ? (
              /* Game stats in center when playing */
              <div className="flex items-center gap-5">
                {gameStats.gameMode !== 'zen' && (
                  <div className="flex items-center gap-1.5 text-sm font-mono font-semibold">
                    <Timer className="w-3.5 h-3.5 text-muted-foreground" />
                    {gameStats.formatTime(gameStats.timer)}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="font-bold">{gameStats.score}</span>
                </div>
                {gameStats.gameMode !== 'zen' && (
                  <Lives lives={gameStats.lives} maxLives={gameStats.maxLives} />
                )}
              </div>
            ) : (
              /* Standard nav links */
              <div className="flex items-center gap-1 bg-secondary/40 rounded-2xl p-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href ||
                    (link.href !== '/' && pathname.startsWith(link.href))
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground hover:bg-background/60'
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* RIGHT: Theme + User */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            <UserMenu />
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 rounded-xl glass"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-border/30 bg-background/95 backdrop-blur-xl"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  )
                })}
                <div className="pt-2">
                  <ThemeSwitcher className="w-full justify-center" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/30">
        <div className="flex items-center justify-around px-2 py-1.5">
          {MOBILE_NAV.map((link) => {
            const isActive = pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {link.icon}
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}