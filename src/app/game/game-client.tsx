'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { Navbar } from '@/components/sudoku/navbar'
import { SudokuBoard } from '@/components/sudoku/board'
import { AICoach } from '@/components/sudoku/ai-coach'
import { NumberPad, ActionButtons, GameControls } from '@/components/sudoku/controls'
import { GameOverModal } from '@/components/sudoku/game-over-modal'
import { TutorialModal } from '@/components/sudoku/tutorial-modal'
import { useSudokuGame } from '@/hooks/useSudokuGame'

interface GameClientProps {
  profile: any
  leaderboard: any[]
  userId: string
  gameMode?: string
}

export function GameClient({ profile, userId, gameMode: initialMode }: GameClientProps) {
  const { status, score, timer, difficulty, startGame, formatTime, gameMode } = useSudokuGame()

  useEffect(() => {
    const mode = (initialMode as any) ?? 'classic'
    startGame('easy', mode)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden pb-16 md:pb-0">
      <ThemeBackground />
      <div className="relative z-10">
        <Navbar />
        <GameOverModal
          status={status}
          score={score}
          timer={timer}
          difficulty={difficulty}
          onRestart={startGame}
        />
        <TutorialModal />

        <main className="px-4 py-4 md:px-6 md:py-6">
          <div className="max-w-7xl mx-auto">
            {/* Difficulty selector */}
            <div className="flex justify-center mb-4">
              <GameControls />
            </div>

            {/* Main layout: board takes most space on left, controls on right */}
            <div className="flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6">

              {/* Board — large on desktop */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center gap-4 w-full lg:flex-1 lg:max-w-[560px]"
              >
                <SudokuBoard />

                {/* Mobile controls below board */}
                <div className="lg:hidden flex flex-col items-center gap-4 w-full">
                  <ActionButtons className="justify-center" />
                  <div className="glass clay rounded-2xl p-3 w-full max-w-[520px]">
                    <NumberPad />
                  </div>
                </div>
              </motion.div>

              {/* Right panel — desktop only */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden lg:flex flex-col gap-4 w-[280px] flex-shrink-0"
              >
                {/* Number pad */}
                <div className="glass clay rounded-2xl p-4">
                  <p className="text-xs text-muted-foreground mb-3 font-medium">Numbers</p>
                  <NumberPad />
                </div>

                {/* Action buttons */}
                <div className="glass clay rounded-2xl p-4">
                  <ActionButtons className="justify-between" />
                </div>

                {/* AI Coach */}
                <AICoach />
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}