'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Home } from 'lucide-react' // Удалили Trophy
import { useRouter } from 'next/navigation'
import type { GameStatus } from '@/store/gameStore'
import type { Difficulty } from '@/lib/sudoku/generator'

interface Props {
  status: GameStatus
  score: number
  timer: number
  difficulty: Difficulty
  onRestart: (d: Difficulty) => void
}

const formatT = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

export function GameOverModal({ status, score, timer, difficulty, onRestart }: Props) {
  const router = useRouter()
  
  // Добавляем проверку, чтобы модалка не прыгала, пока статус меняется
  const show = status === 'won' || status === 'lost' || status === 'timeout'

  // Найди строку с config и замени:
const config = ({
  won: { emoji: '🏆', title: 'Puzzle Solved!', desc: 'Your brain is on fire! 🔥' },
  lost: { emoji: '💔', title: 'Game Over', desc: 'Out of lives. Try again!' },
  timeout: { emoji: '⏰', title: "Time's Up!", desc: '3 minutes. Well done warming up!' },
} as Record<string, { emoji: string; title: string; desc: string }>)[status] 
  ?? { emoji: '🎯', title: '', desc: '' }

  
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/40"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background border shadow-2xl rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden"
          >
            {/* Декоративный фон для красоты */}
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            
            <div className="text-6xl mb-4">{config.emoji}</div>
            <h2 className="text-2xl font-black mb-2">{config.title}</h2>
            <p className="text-muted-foreground text-sm mb-6">{config.desc}</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-muted rounded-2xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Score</p>
                <p className="text-xl font-black text-primary">{score}</p>
              </div>
              <div className="bg-muted rounded-2xl p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Time</p>
                <p className="text-xl font-black text-primary">{formatT(timer)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => onRestart(difficulty)}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                <RotateCcw className="w-5 h-5" />
                Play Again
              </button>
              
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center justify-center gap-2 border rounded-2xl py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </button> 
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}