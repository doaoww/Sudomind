'use client'

import { motion } from 'framer-motion'
import { Lightbulb, Eraser, PencilLine, RotateCcw, ArrowLeft } from 'lucide-react'
import { useSudokuGame, DEV_DIFFICULTY_LABELS } from '@/hooks/useSudokuGame'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import type { Difficulty } from '@/lib/sudoku/generator'

export function NumberPad({ className }: { className?: string }) {
  const { inputNumber, selectedNumber, setSelectedNumber, board, gameMode } = useSudokuGame()

  const numberCounts = Array.from({ length: 9 }, (_, i) => {
    const num = i + 1
    return board.flat().filter((c) => c.value === num && (c.isFixed || c.isCorrect)).length
  })

  const handleNumber = (n: number) => {
    // Toggle: click same number deselects
    if (selectedNumber === n) {
      setSelectedNumber(null)
    } else {
      setSelectedNumber(n)
      inputNumber(n)
    }
  }

  return (
    <div className={cn('grid grid-cols-9 gap-1 md:gap-1.5', className)}>
      {Array.from({ length: 9 }, (_, i) => {
        const n = i + 1
        const isComplete = numberCounts[i] >= 9
        const isSelected = selectedNumber === n

        return (
          <motion.button
            key={n}
            whileTap={{ scale: 0.85 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => handleNumber(n)}
            disabled={isComplete}
            className={cn(
              'aspect-square rounded-xl flex items-center justify-center',
              'text-base md:text-lg font-bold transition-all duration-200',
              'glass',
              isComplete && 'opacity-25 cursor-not-allowed',
              // ← Stays highlighted when selected
              isSelected
                ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                : 'hover:bg-primary hover:text-primary-foreground cursor-pointer',
              gameMode === 'dev' && isSelected && 'shadow-red-500/30'
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
      label: gameMode === 'dev' ? 'Restart' : 'New',
      onClick: () => startGame(difficulty, gameMode),
      active: false,
    },
  ]

  return (
    <div className={cn('flex items-center gap-2 md:gap-3', className)}>
      {actions.map((action) => (
        <motion.button
          key={action.label}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          onClick={action.onClick}
          className={cn(
            'flex flex-col items-center gap-1 px-3 md:px-4 py-2 md:py-2.5 rounded-2xl',
            'glass transition-all duration-200 text-xs font-medium min-w-[52px]',
            action.active
              ? 'bg-primary text-primary-foreground'
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

  const difficulties: { key: Difficulty; label: string; devLabel: string; emoji: string }[] = [
    { key: 'easy', label: 'Easy', devLabel: 'O(log n)', emoji: '🌿' },
    { key: 'medium', label: 'Medium', devLabel: 'O(n)', emoji: '🔥' },
    { key: 'hard', label: 'Hard', devLabel: 'O(n²)', emoji: '💀' },
  ]

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {difficulties.map((d) => (
        <motion.button
          key={d.key}
          whileTap={{ scale: 0.92 }}
          whileHover={{ scale: 1.04 }}
          onClick={() => startGame(d.key, gameMode)}
          className={cn(
            'flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-2xl glass text-xs md:text-sm font-medium',
            'text-muted-foreground hover:text-foreground hover:bg-accent transition-all',
            difficulty === d.key && 'bg-accent text-foreground'
          )}
        >
          <span>{d.emoji}</span>
          <span className="hidden sm:inline">
            {gameMode === 'dev' ? d.devLabel : d.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

// Back to menu button — shown in every game mode
export function BackToMenuButton() {
  const router = useRouter()
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => router.push('/dashboard')}
      className="flex items-center gap-2 px-3 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">Menu</span>
    </motion.button>
  )
}