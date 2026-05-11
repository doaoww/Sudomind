'use client'

import { motion } from 'framer-motion'
import { SudokuCell } from './cell'
import { useSudokuGame } from '@/hooks/useSudokuGame'

export function SudokuBoard() {
  const { board, selectedCell, highlightedCells, selectedNumber, selectCell } = useSudokuGame()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 220 }}
      className="glass clay-lg rounded-2xl p-2 md:p-3"
    >
      <div
        className="border-[3px] border-grid-line-bold rounded-xl overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          // ← +20-30% от предыдущих 600px
          width: 'min(95vw, 660px)',
        }}
      >
        {board.map((row, rIdx) =>
          row.map((cell, cIdx) => {
            const key = `${rIdx}-${cIdx}`
            const isSelected = selectedCell?.[0] === rIdx && selectedCell?.[1] === cIdx
            const isHighlighted = highlightedCells.has(key)
            const isSameNumber = !!(
              selectedNumber &&
              cell.value === selectedNumber &&
              !isSelected
            )
            return (
              <SudokuCell
                key={key}
                cell={cell}
                row={rIdx}
                col={cIdx}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isSameNumber={isSameNumber}
                onClick={() => selectCell(rIdx, cIdx)}
              />
            )
          })
        )}
      </div>
    </motion.div>
  )
}