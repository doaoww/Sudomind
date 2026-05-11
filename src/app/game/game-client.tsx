'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Timer, Heart } from 'lucide-react'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { GlobalNavbar } from '@/components/layout/global-navbar'
import { SudokuBoard } from '@/components/sudoku/board'
import { AICoach } from '@/components/sudoku/ai-coach'
import { NumberPad, ActionButtons, GameControls } from '@/components/sudoku/controls'
import { GameOverModal } from '@/components/sudoku/game-over-modal'
import { TutorialModal } from '@/components/sudoku/tutorial-modal'
import { Lives } from '@/components/sudoku/lives'
import { useSudokuGame } from '@/hooks/useSudokuGame'
import { cn } from '@/lib/utils'
import type { GameMode } from '@/store/gameStore'

interface GameClientProps {
  profile?: any
  userId?: string
  gameMode?: string
}

export function GameClient({ gameMode: initialMode }: GameClientProps) {
  const router = useRouter()
  const {
    status, score, timer, timeLeft, difficulty,
    startGame, gameMode, lives, maxLives, formatTime,
    isNoteMode,
  } = useSudokuGame()

  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    const mode = (initialMode as GameMode) ?? 'classic'
    startGame('easy', mode, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isWarmup = gameMode === 'warmup'
  const isZen = gameMode === 'zen'
  const isDev = gameMode === 'dev'

  // Термины для dev mode
  const labels = {
    score: isDev ? 'Experience' : 'Score',
    lives: isDev ? 'Deploys' : 'Lives',
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-16 md:pb-0">
      <ThemeBackground />
      <div className="relative z-10">
        {/* Navbar — только навигация, никаких игровых стат */}
        <GlobalNavbar />

        <GameOverModal
          status={status}
          score={score}
          timer={timer}
          difficulty={difficulty}
          onRestart={(d) => startGame(d, gameMode)}
        />
        <TutorialModal />

        <main className="px-3 py-3 md:px-5 md:py-4">
          <div className="max-w-[1400px] mx-auto">

            {/* Top bar: Back + Mode badge */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Menu</span>
              </button>

              {/* Mode badge — только индикатор режима */}
              <div className="flex items-center gap-2">
                {isWarmup && (
                  <div className="flex items-center gap-2 glass rounded-2xl px-4 py-1.5">
                    <Timer className="w-4 h-4 text-orange-500" />
                    <span className={cn(
                      'font-mono font-black text-sm',
                      (timeLeft ?? 180) < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'
                    )}>
                      {formatTime(timeLeft ?? 180)}
                    </span>
                    <span className="text-xs text-muted-foreground">Brain Warm-up</span>
                  </div>
                )}
                {isZen && (
                  <div className="glass rounded-2xl px-4 py-1.5 text-sm text-blue-400 font-semibold">
                    🌊 Zen Mode — No pressure
                  </div>
                )}
                {isDev && (
                  <div className="glass rounded-2xl px-4 py-1.5 text-sm text-red-500 font-mono font-bold">
                    ⚡ Developer Mode
                  </div>
                )}
              </div>

              {/* Placeholder чтобы badge был по центру */}
              <div className="w-[80px]" />
            </div>

            {/* Difficulty selector */}
            <div className="flex justify-center mb-4">
              <GameControls />
            </div>

            {/* Main layout */}
            <div className="flex flex-col xl:flex-row items-start justify-center gap-4 xl:gap-5">

              {/* BOARD */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center gap-4 w-full xl:flex-1 xl:max-w-[700px]"
              >
                <SudokuBoard />

                {/* Mobile controls */}
                <div className="xl:hidden flex flex-col items-center gap-4 w-full max-w-[580px]">
                  <ActionButtons className="justify-center" />
                  <div className="glass clay rounded-2xl p-3 w-full">
                    <NumberPad />
                  </div>

                  {/* Mobile stats — одно место */}
                  {!isZen && (
                    <div className="flex items-center gap-4 glass rounded-2xl px-4 py-2">
                      <Lives lives={lives} maxLives={maxLives} />
                      <div className="w-px h-4 bg-border" />
                      <span className="text-sm text-muted-foreground">
                        {isDev ? `${score} XP` : `${score} pts`}
                      </span>
                      {!isWarmup && (
                        <>
                          <div className="w-px h-4 bg-border" />
                          <span className="font-mono text-sm">{formatTime(timer)}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* RIGHT SIDEBAR — все игровые статы здесь */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden xl:flex flex-col gap-3 w-[270px] flex-shrink-0"
              >
                {/* Stats panel — главный блок */}
                <div className="glass clay rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isDev ? 'Session Stats' : 'Game Stats'}
                    </p>
                    {/* Timer */}
                    {!isZen && (
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        isWarmup && (timeLeft ?? 180) < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'
                      )}>
                        {isWarmup ? formatTime(timeLeft ?? 180) : formatTime(timer)}
                      </span>
                    )}
                    {isZen && (
                      <span className="text-blue-400 text-sm font-semibold">∞</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{labels.score}</span>
                    <span className="font-black text-primary">
                      {isDev ? `${score} XP` : `${score} pts`}
                    </span>
                  </div>

                  {/* Lives / Deployment attempts — скрыты в Zen */}
                  {!isZen && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">{labels.lives}</span>
                      <Lives lives={lives} maxLives={maxLives} />
                    </div>
                  )}

                  {isZen && (
                    <div className="flex items-center justify-center pt-2">
                      <span className="text-blue-400 text-sm">No limits · Just flow 🌊</span>
                    </div>
                  )}
                </div>

                {/* Numbers */}
                <div className="glass clay rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Numbers
                    </p>
                    {isNoteMode && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        ✏️ Notes ON
                      </span>
                    )}
                  </div>
                  <NumberPad />
                </div>

                {/* Actions */}
                <div className="glass clay rounded-2xl p-3">
                  <ActionButtons className="justify-between" />
                </div>

                {/* AI Coach */}
                <div className="flex-1">
                  <AICoach />
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}