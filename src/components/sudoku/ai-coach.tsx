'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, ChevronDown, ChevronUp, Code2, GraduationCap, BookOpen } from 'lucide-react'
import { useSudokuGame } from '@/hooks/useSudokuGame'

export function AICoach() {
  const [hint, setHint] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(true)
  const { board, selectedCell, solution, difficulty, gameMode } = useSudokuGame()

  const getHint = useCallback(async () => {
    setIsLoading(true)

    const boardStr = board
      .map((r) => r.map((c) => c.value ?? 0).join(''))
      .join('\n')

    const errorCells: string[] = []
    const emptyCells: string[] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c].isError) errorCells.push(`Row ${r + 1} Col ${c + 1}`)
        if (!board[r][c].value && !board[r][c].isFixed) emptyCells.push(`[${r + 1},${c + 1}]`)
      }
    }

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
      setHint(
        gameMode === 'academy'
          ? '🎓 Technique: Hidden Single\n💡 Look for a box where only one cell can hold a specific number.\n📝 Your task: Scan the top-left box and find where the number 1 can go.'
          : 'Look for rows, columns, or boxes with only one empty cell!'
      )
    } finally {
      setIsLoading(false)
    }
  }, [board, selectedCell, difficulty, gameMode])

  const isDev = gameMode === 'dev'
  const isAcademy = gameMode === 'academy'

  // Конфигурация по режиму
  const config = {
    icon: isDev
      ? <Code2 className="w-4 h-4 text-primary" />
      : isAcademy
        ? <GraduationCap className="w-4 h-4 text-purple-500" />
        : <Bot className="w-4 h-4 text-primary" />,
    name: isDev ? 'Stack Tracer AI' : isAcademy ? 'Prof. Sana' : 'Sana AI Coach',
    subtitle: isDev ? 'Code Reviewer' : isAcademy ? 'Academy Teacher' : 'Gemini 1.5 Flash',
    placeholder: isDev
      ? 'Click "Debug" to analyze your algorithm 🔍'
      : isAcademy
        ? 'Click "Explain Board" and I\'ll teach you the next technique! 📚'
        : 'Click the button and I\'ll analyze your board! 🧠',
    buttonText: isDev ? 'Run Debugger' : isAcademy ? 'Explain Board' : 'Get AI Hint',
    loadingText: isDev ? 'Debugging...' : isAcademy ? 'Analyzing lesson...' : 'Analyzing...',
    panelClass: isAcademy
      ? 'rounded-3xl p-4 space-y-3 bg-purple-500/5 border border-purple-500/20 backdrop-blur-sm'
      : 'coach-panel rounded-3xl p-4 space-y-3',
    buttonClass: isAcademy
      ? 'w-full flex items-center justify-center gap-2 bg-purple-600 text-white rounded-2xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity'
      : 'w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity',
  }

  // Форматируем Academy ответ — разбиваем на секции
  const renderHint = (text: string) => {
    if (!isAcademy) {
      return <p className="text-sm leading-relaxed">{text}</p>
    }

    // Academy format: разбиваем по эмодзи-секциям
    const lines = text.split('\n').filter(Boolean)
    return (
      <div className="space-y-2">
        {lines.map((line, i) => {
          const isTechnique = line.startsWith('🎓')
          const isObservation = line.startsWith('💡')
          const isTask = line.startsWith('📝')
          return (
            <div
              key={i}
              className={
                isTechnique
                  ? 'text-sm font-bold text-purple-600 dark:text-purple-400'
                  : isObservation
                    ? 'text-sm text-foreground'
                    : isTask
                      ? 'text-sm font-semibold text-purple-500 bg-purple-500/10 rounded-xl px-2 py-1'
                      : 'text-sm text-muted-foreground'
              }
            >
              {line}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={config.panelClass}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isAcademy ? 'bg-purple-500/10' : 'bg-primary/10'
          }`}>
            {config.icon}
          </div>
          <div>
            <p className="text-sm font-semibold">{config.name}</p>
            <p className="text-xs text-muted-foreground">{config.subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Academy: Current Lesson banner */}
      {isAcademy && (
        <div className="flex items-center gap-2 bg-purple-500/10 rounded-xl px-3 py-2">
          <BookOpen className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
            {hint ? 'Current Lesson' : 'Ready to learn? Ask for a hint!'}
          </p>
        </div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div className={`min-h-[80px] rounded-2xl p-3 ${
              isAcademy
                ? 'bg-purple-500/5 border border-purple-500/15'
                : 'bg-primary/5 border border-primary/10'
            }`}>
              {isLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Sparkles className={`w-4 h-4 ${isAcademy ? 'text-purple-500' : ''}`} />
                  </motion.div>
                  {config.loadingText}
                </div>
              ) : hint ? (
                <motion.div
                  key={hint}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {renderHint(hint)}
                </motion.div>
              ) : (
                <p className="text-sm text-muted-foreground">{config.placeholder}</p>
              )}
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={getHint}
              disabled={isLoading}
              className={config.buttonClass}
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? config.loadingText : config.buttonText}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}