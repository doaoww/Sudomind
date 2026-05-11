'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Eraser, PencilLine, RotateCcw, ArrowLeft } from 'lucide-react'
import { useSudokuGame } from '@/hooks/useSudokuGame'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Difficulty } from '@/lib/sudoku/generator'

export function NumberPad({ className }: { className?: string }) {
  const { inputNumber, selectedNumber, setSelectedNumber, board, gameMode } = useSudokuGame()

  const counts = Array.from({ length: 9 }, (_, i) => {
    const n = i + 1
    return board.flat().filter((c) => c.value === n && (c.isFixed || c.isCorrect)).length
  })

  const handleNumber = (n: number) => {
    setSelectedNumber(n)
    inputNumber(n)
  }

  return (
    <div className={cn('grid grid-cols-9 gap-1 md:gap-2', className)}>
      {Array.from({ length: 9 }, (_, i) => {
        const n = i + 1
        const done = counts[i] >= 9
        const active = selectedNumber === n

        return (
          <motion.button
            key={n}
            whileTap={{ scale: 0.82 }}
            whileHover={!done ? { scale: 1.12 } : {}}
            onClick={() => handleNumber(n)}
            disabled={done}
            className={cn(
              'aspect-square rounded-xl flex items-center justify-center',
              'text-base md:text-xl font-black transition-all duration-150',
              done && 'opacity-25 cursor-not-allowed',
              // ← Остаётся залитым пока active
              active
                ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/50 scale-110'
                : 'glass text-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer',
            )}
          >
            {n}
          </motion.button>
        )
      })}
    </div>
  )
}

export function ActionButtons({ className }: { className?: string }) {
  const { eraseCell, useHint, toggleNoteMode, isNoteMode, startGame, difficulty, gameMode } = useSudokuGame()

  const actions = [
    {
      icon: <Eraser className="w-4 h-4" />,
      label: gameMode === 'dev' ? 'Delete' : 'Erase',
      onClick: eraseCell,
      active: false,
    },
    {
      icon: <PencilLine className="w-4 h-4" />,
      label: gameMode === 'dev' ? 'Comment' : 'Notes',
      onClick: toggleNoteMode,
      active: isNoteMode,
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: gameMode === 'dev' ? 'Debug' : 'Hint',
      onClick: useHint,
      active: false,
    },
    {
      icon: <RotateCcw className="w-4 h-4" />,
      label: 'New',
      onClick: () => startGame(difficulty, gameMode),
      active: false,
    },
  ]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {actions.map((action) => (
        <motion.button
          key={action.label}
          whileTap={{ scale: 0.88 }}
          whileHover={{ scale: 1.06 }}
          onClick={action.onClick}
          className={cn(
            'flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl',
            'glass text-xs font-semibold transition-all duration-200 min-w-[54px]',
            action.active
              ? 'bg-primary text-primary-foreground ring-2 ring-primary/30'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          )}
        >
          {action.icon}
          <span>{action.label}</span>
        </motion.button>
      ))}
    </div>
  )
}

export function GameControls({ className }: { className?: string }) {
  const { startGame, gameMode, difficulty } = useSudokuGame()

  const levels: { key: Difficulty; label: string; devLabel: string; emoji: string }[] = [
    { key: 'easy', label: 'Easy', devLabel: 'O(log n)', emoji: '🌿' },
    { key: 'medium', label: 'Medium', devLabel: 'O(n)', emoji: '🔥' },
    { key: 'hard', label: 'Hard', devLabel: 'O(n²)', emoji: '💀' },
  ]

  return (
    <div className={cn('flex items-center gap-2 glass rounded-2xl p-1', className)}>
      {levels.map((d) => {
        // ← difficulty === d.key — сохраняется active state
        const isActive = difficulty === d.key
        return (
          <motion.button
            key={d.key}
            whileTap={{ scale: 0.92 }}
            onClick={() => startGame(d.key, gameMode)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              // ← Active: залито primary
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <span>{d.emoji}</span>
            <span>{gameMode === 'dev' ? d.devLabel : d.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

export function BackToMenuButton() {
  const router = useRouter()
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/dashboard')}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Menu</span>
    </motion.button>
  )
}