'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, ChevronDown, ChevronUp, Code2 } from 'lucide-react'
import { useSudokuGame } from '@/hooks/useSudokuGame'

export function AICoach() {
  const [hint, setHint] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const { board, selectedCell, solution, difficulty, gameMode } = useSudokuGame()

  const getHint = useCallback(async () => {
    setIsLoading(true)

    // Build real board analysis to send to AI
    const boardStr = board
      .map((r) => r.map((c) => c.value ?? 0).join(''))
      .join('\n')

    // Find cells with errors
    const errorCells: string[] = []
    const emptyCells: string[] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c].isError) errorCells.push(`Row ${r + 1} Col ${c + 1}`)
        if (!board[r][c].value && !board[r][c].isFixed) emptyCells.push(`[${r + 1},${c + 1}]`)
      }
    }

    // Find rows/cols/boxes with only 1 missing
    const analysisHints: string[] = []
    for (let i = 0; i < 9; i++) {
      const rowVals = board[i].map((c) => c.value).filter(Boolean)
      if (rowVals.length === 8) {
        const missing = [1,2,3,4,5,6,7,8,9].find(n => !rowVals.includes(n))
        analysisHints.push(`Row ${i + 1} is missing only the number ${missing}`)
      }
      const colVals = board.map((r) => r[i].value).filter(Boolean)
      if (colVals.length === 8) {
        const missing = [1,2,3,4,5,6,7,8,9].find(n => !colVals.includes(n))
        analysisHints.push(`Column ${i + 1} is missing only the number ${missing}`)
      }
    }
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const vals: number[] = []
        for (let r = br * 3; r < br * 3 + 3; r++) {
          for (let c = bc * 3; c < bc * 3 + 3; c++) {
            if (board[r][c].value) vals.push(board[r][c].value!)
          }
        }
        if (vals.length === 8) {
          const missing = [1,2,3,4,5,6,7,8,9].find(n => !vals.includes(n))
          analysisHints.push(`The 3×3 box at top-left [${br*3+1},${bc*3+1}] is missing only ${missing}`)
        }
      }
    }

    try {
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: boardStr,
          selectedCell,
          difficulty,
          gameMode,
          errorCells,
          emptyCellsCount: emptyCells.length,
          analysisHints,
        }),
      })
      const data = await res.json()
      setHint(data.hint)
    } catch {
      setHint('Look for rows, columns, or boxes with only one empty cell!')
    } finally {
      setIsLoading(false)
    }
  }, [board, selectedCell, difficulty, gameMode])

  const isDev = gameMode === 'dev'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="coach-panel rounded-3xl p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            {isDev
              ? <Code2 className="w-4 h-4 text-primary" />
              : <Bot className="w-4 h-4 text-primary" />
            }
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isDev ? 'Stack Tracer AI' : 'Sana AI Coach'}
            </p>
            <p className="text-xs text-muted-foreground">Gemini 1.5 Flash</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div className="min-h-[80px] rounded-2xl bg-primary/5 border border-primary/10 p-3">
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  {isDev ? 'Analyzing stack trace...' : 'Thinking...'}
                </div>
              ) : hint ? (
                <motion.p
                  key={hint}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm leading-relaxed"
                >
                  {hint}
                </motion.p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isDev
                    ? 'Click "Debug" to analyze the current state of your algorithm 🔍'
                    : 'Click the button and I\'ll analyze your board! 🧠'
                  }
                </p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={getHint}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading
                ? (isDev ? 'Debugging...' : 'Analyzing...')
                : (isDev ? 'Run Debugger' : 'Get AI Hint')
              }
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}