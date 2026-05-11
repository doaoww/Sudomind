'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Trophy, Clock, Users } from 'lucide-react'
import Link from 'next/link'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { SudokuBoard } from '@/components/sudoku/board'
import { AICoach } from '@/components/sudoku/ai-coach'
import { NumberPad, ActionButtons } from '@/components/sudoku/controls'
import { Lives } from '@/components/sudoku/lives'
import { GameOverModal } from '@/components/sudoku/game-over-modal'
import { useSudokuGame } from '@/hooks/useSudokuGame'

// Seed based on date — everyone gets same puzzle
function getDailySeed(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

export default function DailyPage() {
  const { startGame, status, lives, maxLives, score, timer, difficulty, formatTime } = useSudokuGame()

  // Найди useEffect и замени:
useEffect(() => {
  if (hasStarted.current) return
  hasStarted.current = true
  startGame('medium', 'daily', true) // ← silent = true
}, [])

// Добавь ref:
const hasStarted = useRef(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThemeBackground />
      <div className="relative z-10">
        {/* Nav */}
        <nav className="glass border-b border-border/40 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black">S</span>
              </div>
              <span className="font-bold hidden sm:block">
                Sudo<span className="text-primary">mind</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold hidden sm:block">{today}</span>
            </div>

            <div className="flex items-center gap-3">
              <Lives lives={lives} maxLives={maxLives} />
              <div className="flex items-center gap-1.5 text-sm font-mono">
                <Clock className="w-4 h-4 text-muted-foreground" />
                {formatTime(timer)}
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </nav>

        <GameOverModal
          status={status}
          score={score}
          timer={timer}
          difficulty={difficulty}
          onRestart={() => startGame('medium')}
        />

        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium mb-4 border border-primary/20">
              <CalendarDays className="w-4 h-4 text-primary" />
              Daily Challenge · {today}
            </div>
            <h1 className="text-3xl font-black mb-2">
              Everyone Solves the <span className="text-primary">Same Puzzle</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>247 solving now</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-500" />
                <span>Leaderboard resets at midnight</span>
              </div>
            </div>
          </motion.div>

          {/* Game layout */}
          <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
            <div className="flex flex-col items-center gap-5">
              <SudokuBoard />
              <div className="flex flex-col items-center gap-4 w-full max-w-sm lg:hidden">
                <ActionButtons className="justify-center" />
                <NumberPad />
              </div>
            </div>

            <div className="hidden lg:flex flex-col gap-4 w-72">
              <AICoach />
              <div className="glass clay rounded-3xl p-4">
                <NumberPad />
              </div>
              <div className="glass clay rounded-3xl p-4">
                <ActionButtons className="justify-center" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}