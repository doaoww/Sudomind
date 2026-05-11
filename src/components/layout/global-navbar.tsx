'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Gamepad2, LayoutDashboard, Trophy, CalendarDays } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/layout/user-menu'
import { cn } from '@/lib/utils'



const AUTH_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: '/game', label: 'Play', icon: <Gamepad2 className="w-4 h-4" /> },
  { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
  { href: '/daily', label: 'Daily', icon: <CalendarDays className="w-4 h-4" /> },
]

const GUEST_LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#themes', label: 'Themes' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

const MOBILE_LINKS = [
  { href: '/dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/game', label: 'Play', icon: <Gamepad2 className="w-5 h-5" /> },
  { href: '/leaderboard', label: 'Ranks', icon: <Trophy className="w-5 h-5" /> },
  { href: '/daily', label: 'Daily', icon: <CalendarDays className="w-5 h-5" /> },
]

interface GlobalNavbarProps {
  isGuest?: boolean
}

export function GlobalNavbar({ isGuest = false }: GlobalNavbarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const links = isGuest ? GUEST_LINKS : AUTH_LINKS

  return (
    <>
      <nav className="glass border-b border-border/30 sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href={isGuest ? '/' : '/dashboard'} className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black">S</span>
            </div>
            <span className="font-black hidden sm:block">
              Sudo<span className="text-primary">mind</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center flex-1 justify-center">
            <div className="flex items-center gap-1 bg-secondary/30 rounded-2xl p-1">
              {links.map((link) => {
                const isActive = 'icon' in link
                  ? pathname === link.href || pathname.startsWith(link.href + '/')
                  : false
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    {'icon' in link && (link.icon as React.ReactNode)}
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <ThemeSwitcher />
            </div>
            {isGuest ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Play Free →
                </Link>
              </div>
            ) : (
              <UserMenu />
            )}
            <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-xl glass">
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
                {(isGuest ? [
                  { href: '/auth/login', label: 'Sign In' },
                  { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
                  { href: '/daily', label: 'Daily Challenge', icon: <CalendarDays className="w-4 h-4" /> },
                ] : AUTH_LINKS).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                      pathname === link.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    {'icon' in link && link.icon}
                    {link.label}
                  </Link>
                ))}
                <div className="pt-2">
                  <ThemeSwitcher className="w-full justify-center" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile bottom nav */}
      {!isGuest && (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/30">
          <div className="flex items-center justify-around px-2 py-1.5">
            {MOBILE_LINKS.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '?')
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
      )}
    </>
  )
}