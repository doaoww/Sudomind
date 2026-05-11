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
      whileTap={{ scale: 0.88 }}
      className={cn(
        'relative w-full aspect-square flex items-center justify-center',
        'border border-grid-line focus:outline-none select-none cursor-pointer',
        'transition-colors duration-100',
        isThickRight && 'border-r-[3px] border-r-grid-line-bold',
        isThickBottom && 'border-b-[3px] border-b-grid-line-bold',
        isSelected && 'sudoku-selected',
        !isSelected && isHighlighted && 'sudoku-highlighted',
        !isSelected && !isHighlighted && isSameNumber && cell.value && 'bg-primary/20',
        cell.isError && !isSelected && 'bg-red-100 dark:bg-red-950/50',
        cell.isError && isSelected && 'bg-red-200 dark:bg-red-900/60',
      )}
    >
      {/* Fixed number */}
      {cell.isFixed && cell.value !== null && (
        <span className="number-fixed font-black text-[1.3em] md:text-[1.45em] leading-none">
          {cell.value}
        </span>
      )}

      {/* User correct */}
      {!cell.isFixed && cell.value !== null && !cell.isError && (
        <AnimatePresence mode="wait">
          <motion.span
            key={`c-${cell.value}-${row}-${col}`}
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 600, damping: 22 }}
            className="number-user text-[1.3em] md:text-[1.45em] font-bold leading-none"
          >
            {cell.value}
          </motion.span>
        </AnimatePresence>
      )}

      {/* User error — stays */}
      {!cell.isFixed && cell.value !== null && cell.isError && (
        <motion.span
          key={`e-${cell.value}-${row}-${col}`}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1, x: [-4, 4, -3, 3, 0] }}
          transition={{ duration: 0.3 }}
          className="number-error text-[1.3em] md:text-[1.45em] font-bold leading-none"
        >
          {cell.value}
        </motion.span>
      )}

      {/* Notes 3×3 */}
      {!cell.isFixed && cell.value === null && cell.notes.length > 0 && (
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[1px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className={cn(
                'flex items-center justify-center',
                'text-[10px] md:text-[12px] leading-none font-semibold',
                cell.notes.includes(n) ? 'text-muted-foreground' : 'opacity-0'
              )}
            >
              {cell.notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  )
}