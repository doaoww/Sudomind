'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { CellState } from '@/store/gameStore'

interface CellProps {
  cell: CellState
  row: number
  col: number
  isSelected: boolean
  isHighlighted: boolean
  isSameNumber: boolean
  onClick: () => void
}

export function SudokuCell({
  cell, row, col,
  isSelected, isHighlighted, isSameNumber,
  onClick,
}: CellProps) {
  const isThickRight = col === 2 || col === 5
  const isThickBottom = row === 2 || row === 5

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.93 }}
      className={cn(
        'relative w-full aspect-square flex items-center justify-center',
        'border border-grid-line focus:outline-none select-none cursor-pointer',
        'transition-colors duration-100',
        isThickRight && 'border-r-[2.5px] border-r-grid-line-bold',
        isThickBottom && 'border-b-[2.5px] border-b-grid-line-bold',
        isSelected && 'sudoku-selected',
        !isSelected && isHighlighted && 'sudoku-highlighted',
        !isSelected && !isHighlighted && isSameNumber && cell.value && 'bg-primary/15',
        // Error stays red until user erases
        cell.isError && !isSelected && 'bg-red-100 dark:bg-red-950/40',
        cell.isError && isSelected && 'bg-red-200 dark:bg-red-900/60',
        // Correct & locked — subtle green tint for user-filled
        cell.isCorrect && !cell.isFixed && !isSelected && 'bg-transparent',
      )}
    >
      {/* Fixed number (given) */}
      {cell.isFixed && cell.value !== null && (
        <span className="number-fixed font-bold text-[1em] md:text-[1.15em]">
          {cell.value}
        </span>
      )}

      {/* User number — correct */}
      {!cell.isFixed && cell.value !== null && !cell.isError && (
        <AnimatePresence mode="wait">
          <motion.span
            key={`correct-${cell.value}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="number-user text-[1em] md:text-[1.15em] font-semibold"
          >
            {cell.value}
          </motion.span>
        </AnimatePresence>
      )}

      {/* User number — ERROR (stays red, user must erase) */}
      {!cell.isFixed && cell.value !== null && cell.isError && (
        <motion.span
          key={`error-${cell.value}`}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1, x: [-3, 3, -2, 2, 0] }}
          transition={{ duration: 0.35 }}
          className="number-error text-[1em] md:text-[1.15em] font-bold"
        >
          {cell.value}
        </motion.span>
      )}

      {/* Notes 3×3 grid */}
      {!cell.isFixed && cell.value === null && cell.notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[1px]"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className={cn(
                'flex items-center justify-center',
                'text-[10px] md:text-[11px] leading-none font-semibold',
                cell.notes.includes(n)
                  ? 'text-muted-foreground'
                  : 'opacity-0 pointer-events-none'
              )}
            >
              {cell.notes.includes(n) ? n : '·'}
            </span>
          ))}
        </motion.div>
      )}
    </motion.button>
  )
}