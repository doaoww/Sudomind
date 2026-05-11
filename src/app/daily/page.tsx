'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Trophy, Clock, Users, Heart } from 'lucide-react'
import Link from 'next/link'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { SudokuBoard } from '@/components/sudoku/board'
import { AICoach } from '@/components/sudoku/ai-coach'
import { NumberPad, ActionButtons } from '@/components/sudoku/controls'
import { Lives } from '@/components/sudoku/lives'
import { GameOverModal } from '@/components/sudoku/game-over-modal'
import { useSudokuGame } from '@/hooks/useSudokuGame'

export default function DailyPage() {
  const { startGame, status, lives, maxLives, score, timer, difficulty, formatTime } = useSudokuGame()
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    startGame('medium', 'daily', true)
  }, [])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThemeBackground />
      <div className="relative z-10">

        {/* Nav — только навигация, без игровых стат */}
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

            {/* Только ThemeSwitcher — без Lives и Timer */}
            <ThemeSwitcher />
          </div>
        </nav>

        <GameOverModal
          status={status}
          score={score}
          timer={timer}
          difficulty={difficulty}
          onRestart={() => startGame('medium', 'daily', true)}
        />

        <main className="max-w-6xl mx-auto px-6 py-8">
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

          <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
            <div className="flex flex-col items-center gap-5">
              <SudokuBoard />
              {/* Mobile controls */}
              <div className="flex flex-col items-center gap-4 w-full max-w-sm lg:hidden">
                <ActionButtons className="justify-center" />
                <NumberPad />
                {/* Mobile stats */}
                <div className="flex items-center gap-4 glass rounded-2xl px-4 py-2 w-full justify-center">
                  <Lives lives={lives} maxLives={maxLives} />
                  <div className="w-px h-4 bg-border" />
                  <div className="flex items-center gap-1.5 text-sm font-mono">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {formatTime(timer)}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR — Lives + Timer здесь */}
            <div className="hidden lg:flex flex-col gap-4 w-72">

              {/* Stats panel */}
              <div className="glass clay rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Game Stats
                </p>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Score</span>
                  <span className="font-black text-primary">{score} pts</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Timer
                  </span>
                  <span className="font-mono text-sm font-bold">{formatTime(timer)}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-muted-foreground">Lives</span>
                  <Lives lives={lives} maxLives={maxLives} />
                </div>
              </div>

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