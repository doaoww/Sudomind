'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, CalendarDays, Trophy, Brain } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/layout/user-menu'

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <nav className="relative z-20 glass border-b border-border/40 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-black text-lg">S</span>
            </div>
            <span className="font-bold text-lg">
              Sudo<span className="text-primary">mind</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#themes" className="hover:text-foreground transition-colors">Themes</Link>
            <Link href="/leaderboard" className="hover:text-foreground transition-colors">Leaderboard</Link>
            <Link href="/#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/daily" className="hover:text-foreground transition-colors flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              Daily
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <ThemeSwitcher />
            {/* ← User menu handles both logged in and not */}
            <UserMenu />
            <Link
              href="/game"
              className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Play →
            </Link>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-xl glass"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3"
          >
            <ThemeSwitcher className="w-full justify-center mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: '#features', label: 'Features', icon: <Brain className="w-4 h-4" /> },
                { href: '/leaderboard', label: 'Leaderboard', icon: <Trophy className="w-4 h-4" /> },
                { href: '/daily', label: 'Daily', icon: <CalendarDays className="w-4 h-4" /> },
                { href: '/profile', label: 'Profile', icon: null },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 p-3 rounded-xl glass text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              <UserMenu compact />
              <Link href="/game" className="flex-1 text-center py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold" onClick={() => setOpen(false)}>
                Play Free
              </Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/40">
        <div className="flex items-center justify-around px-6 py-2">
          <Link href="/" className="flex flex-col items-center gap-0.5 p-2 text-primary">
            <Brain className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/daily" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary">
            <CalendarDays className="w-5 h-5" />
            <span className="text-[10px]">Daily</span>
          </Link>
          <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary">
            <Trophy className="w-5 h-5" />
            <span className="text-[10px]">Ranks</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary">
            <span className="text-lg">👤</span>
            <span className="text-[10px]">Profile</span>
          </Link>
        </div>
      </div>
    </>
  )
}