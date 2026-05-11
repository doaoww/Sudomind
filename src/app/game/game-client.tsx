'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { SudokuBoard } from '@/components/sudoku/board'
import { AICoach } from '@/components/sudoku/ai-coach'
import { NumberPad, ActionButtons, GameControls } from '@/components/sudoku/controls'
import { GameOverModal } from '@/components/sudoku/game-over-modal'
import { TutorialModal } from '@/components/sudoku/tutorial-modal'
import { GlobalNavbar } from '@/components/layout/global-navbar'
import { Lives } from '@/components/sudoku/lives'
import { useSudokuGame } from '@/hooks/useSudokuGame'
import { Timer, Star } from 'lucide-react'
import type { GameMode } from '@/store/gameStore'

interface GameClientProps {
  profile?: any
  leaderboard?: any[]
  userId?: string
  gameMode?: string
}

export function GameClient({ gameMode: initialMode }: GameClientProps) {
  const {
    status, score, timer, difficulty,
    startGame, gameMode, lives, maxLives, formatTime,
  } = useSudokuGame()

  // ← useRef гарантирует один вызов даже в React Strict Mode
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    const mode = (initialMode as GameMode) ?? 'classic'
    // silent = true → нет toast при автостарте
    startGame('easy', mode, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden pb-16 md:pb-0">
      <ThemeBackground />
      <div className="relative z-10">
        <GlobalNavbar gameStats={{ lives, maxLives, score, timer, status, formatTime, gameMode }} />

        <GameOverModal
          status={status}
          score={score}
          timer={timer}
          difficulty={difficulty}
          onRestart={(d) => startGame(d, gameMode)}
        />
        <TutorialModal />

        <main className="px-3 py-4 md:px-6 md:py-5">
          {/* Max width большой для просторного layout */}
          <div className="max-w-[1400px] mx-auto">
            {/* Difficulty selector centered */}
            <div className="flex justify-center mb-4">
              <GameControls />
            </div>

            {/* Main layout */}
            <div className="flex flex-col xl:flex-row items-start justify-center gap-4 xl:gap-6">

              {/* BOARD — занимает ~65% */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center gap-4 w-full xl:flex-1 xl:max-w-[680px]"
              >
                <SudokuBoard />

                {/* Mobile controls */}
                <div className="xl:hidden flex flex-col items-center gap-4 w-full max-w-[580px]">
                  <ActionButtons className="justify-center" />
                  <div className="glass clay rounded-2xl p-3 w-full">
                    <NumberPad />
                  </div>
                </div>
              </motion.div>

              {/* RIGHT PANEL — desktop, compact but taller */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden xl:flex flex-col gap-3 w-[280px] flex-shrink-0"
              >
                <div className="glass clay rounded-2xl p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
                    Numbers
                  </p>
                  <NumberPad />
                </div>

                <div className="glass clay rounded-2xl p-3">
                  <ActionButtons className="justify-between" />
                </div>

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