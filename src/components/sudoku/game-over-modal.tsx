'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, RotateCcw, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { GameStatus } from '@/store/gameStore'
import type { Difficulty } from '@/lib/sudoku/generator'

interface GameOverModalProps {
  status: GameStatus
  score: number
  timer: number
  difficulty: Difficulty
  onRestart: (difficulty: Difficulty) => void
}

export function GameOverModal({ status, score, timer, difficulty, onRestart }: GameOverModalProps) {
  const router = useRouter()
  const isWon = status === 'won'
  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <AnimatePresence>
      {(status === 'won' || status === 'lost') && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass clay-lg rounded-3xl p-8 max-w-sm w-full mx-4 text-center"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              className="text-6xl mb-4"
            >
              {isWon ? '🏆' : '💔'}
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold mb-2"
            >
              {isWon ? 'Puzzle Solved!' : 'Game Over'}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm mb-6"
            >
              {isWon ? 'Congratulations! You nailed it 🎉' : 'You ran out of lives. Try again!'}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-3 mb-6"
            >
              <div className="bg-primary/10 rounded-2xl p-3">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-xl font-bold text-primary">{score}</p>
              </div>
              <div className="bg-primary/10 rounded-2xl p-3">
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="text-xl font-bold text-primary">{formatTime(timer)}</p>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3"
            >
              <button
                onClick={() => onRestart(difficulty)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3 font-semibold hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center justify-center gap-2 glass rounded-2xl py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}