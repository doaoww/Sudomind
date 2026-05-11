'use client'

import { useCallback, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useGameStore, type GameMode } from '@/store/gameStore'
import { generatePuzzle, type Difficulty } from '@/lib/sudoku/generator'
import { validateCell, isComplete, getHighlightedCells } from '@/lib/sudoku/validator'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/theme-provider'
import type { CellState } from '@/store/gameStore'

export const DEV_DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'O(log n)',
  medium: 'O(n)',
  hard: 'O(n²)',
}

// ← Глобальный ref вне компонента — не пересоздаётся при рендере
let globalInterval: ReturnType<typeof setInterval> | null = null

function clearGlobalInterval() {
  if (globalInterval !== null) {
    clearInterval(globalInterval)
    globalInterval = null
  }
}

export function useSudokuGame() {
  const store = useGameStore()
  const supabase = createClient()
  const { setTheme } = useTheme()
  // Флаг что компонент смонтирован
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // ← Один useEffect для таймера — следит за status
  useEffect(() => {
    const currentStatus = store.status
    const currentMode = store.gameMode

    if (currentStatus === 'playing') {
      // Очищаем предыдущий интервал
      clearGlobalInterval()
      
      // Запускаем один интервал
      globalInterval = setInterval(() => {
        if (!mountedRef.current) {
          clearGlobalInterval()
          return
        }
        
        const state = useGameStore.getState()
        // Проверяем статус из store напрямую
        if (state.status !== 'playing') {
          clearGlobalInterval()
          return
        }

        // Warmup mode — обратный отсчёт
        if (state.gameMode === 'warmup' && state.timeLeft !== null) {
          useGameStore.getState().decrementTimeLeft()
        } else if (state.gameMode !== 'zen') {
          // Обычный таймер — только для не-zen
          useGameStore.setState((prev) => ({ timer: prev.timer + 1 }))
        }
      }, 1000)
    } else {
      clearGlobalInterval()
    }

    return () => {
      clearGlobalInterval()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status])

  // startGame — основная функция
  const startGame = useCallback(
    (difficulty: Difficulty, mode: GameMode = 'classic', silent = false) => {
      // Сначала останавливаем интервал
      clearGlobalInterval()
      
      // Сбрасываем store
      store.resetGame()
      store.setDifficulty(difficulty)
      store.setGameMode(mode)

      // Тема для dev mode
      if (mode === 'dev') setTheme('nfactorial')

      // Генерируем пазл
      // Warmup — всегда easy для мозговой разминки
      const actualDifficulty = mode === 'warmup' ? 'easy' : difficulty
      const { puzzle, solution } = generatePuzzle(actualDifficulty)
      
      const board: CellState[][] = puzzle.map((row) =>
        row.map((value) => ({
          value,
          notes: [],
          isFixed: value !== null,
          isError: false,
          isCorrect: value !== null,
        }))
      )

      store.setBoard(board)
      store.setSolution(solution)

      // Настройки по режиму
      if (mode === 'zen') {
        useGameStore.setState({ lives: 999, maxLives: 999 })
      } else if (mode === 'warmup') {
        useGameStore.setState({ timeLeft: 180, lives: 999 }) // 3 минуты
      } else {
        useGameStore.setState({ lives: 3, maxLives: 3, timeLeft: null })
      }

      // Устанавливаем статус ПОСЛЕДНИМ — это триггерит useEffect таймера
      store.setStatus('playing')

      // ← silent = true при автостарте → нет toast
      if (!silent) {
        const label = mode === 'dev'
          ? DEV_DIFFICULTY_LABELS[difficulty]
          : { easy: '🌿 Easy', medium: '🔥 Medium', hard: '💀 Hard' }[difficulty]
        const modeEmoji = {
          classic: '', zen: '🌊 Zen · ', warmup: '☀️ Warm-up · ',
          dev: '⚡ Dev · ', academy: '🎓 Academy · ', daily: '📅 Daily · ',
        }[mode]
        toast.success(`${modeEmoji}${label}`, { duration: 1500 })
      }
    },
    [store, setTheme]
  )

  const selectCell = useCallback((row: number, col: number) => {
    store.setSelectedCell([row, col])
    store.setHighlightedCells(getHighlightedCells(row, col))
    const val = store.board[row][col].value
    if (val) store.setSelectedNumber(val)
  }, [store])

  const inputNumber = useCallback((num: number) => {
    const { selectedCell, board, solution, isNoteMode, status, gameMode } = store
    if (!selectedCell || status !== 'playing') return

    const [row, col] = selectedCell
    const cell = board[row][col]

    if (cell.isFixed || cell.isCorrect) {
      toast.info(
        gameMode === 'dev' ? '🐛 Cannot modify deployed code!' : 'Cell is locked 🔒',
        { duration: 1000 }
      )
      return
    }

    if (isNoteMode) {
      const notes = cell.notes.includes(num)
        ? cell.notes.filter((n) => n !== num)
        : [...cell.notes, num].sort()
      store.updateCell(row, col, { notes, isError: false })
      return
    }

    const correct = validateCell(
      board.map((r) => r.map((c) => c.value)),
      solution, row, col, num
    )

    if (!correct) {
      store.updateCell(row, col, { value: num, isError: true, isCorrect: false, notes: [] })

      if (gameMode === 'zen') {
        toast.info('Keep going! 🌊', { duration: 800 })
        return
      }

      store.loseLife()
      const livesLeft = useGameStore.getState().lives
      const msg = gameMode === 'dev'
        ? `🐛 Bug detected! ${livesLeft} deploys left`
        : `Wrong! ${livesLeft} ❤️ left`
      toast.error(msg, { duration: 1500 })
      return
    }

    store.updateCell(row, col, { value: num, isError: false, isCorrect: true, notes: [] })

    // Очищаем заметки в связанных ячейках
    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3
    const related: [number, number][] = []
    for (let i = 0; i < 9; i++) {
      related.push([row, i], [i, col])
    }
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) related.push([r, c])
    }
    related.forEach(([r, c]) => {
      const cur = useGameStore.getState().board[r][c]
      if (cur.notes.includes(num)) {
        store.updateCell(r, c, { notes: cur.notes.filter((n) => n !== num) })
      }
    })

    const pts = { easy: 10, medium: 20, hard: 30 }[store.difficulty]
    store.addScore(pts)

    const finalBoard = useGameStore.getState().board
    if (isComplete(finalBoard.map((r) => r.map((c) => c.value)), solution)) {
      clearGlobalInterval()
      store.setStatus('won')
      const winMsg = store.gameMode === 'dev' ? '🚀 Deployed!' : '🎉 Puzzle solved!'
      toast.success(winMsg, { duration: 3000 })
      saveGame()
    }
  }, [store])

  const eraseCell = useCallback(() => {
    const { selectedCell, board } = store
    if (!selectedCell) return
    const [row, col] = selectedCell
    const cell = board[row][col]
    if (cell.isFixed || cell.isCorrect) return
    store.updateCell(row, col, { value: null, notes: [], isError: false })
  }, [store])

  const useHint = useCallback(() => {
    const { board, solution, status } = store
    if (status !== 'playing') return

    const candidates: [number, number][] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!board[r][c].isFixed && !board[r][c].isCorrect) candidates.push([r, c])
      }
    }
    if (!candidates.length) return

    const [row, col] = candidates[Math.floor(Math.random() * candidates.length)]
    const val = solution[row][col]
    store.updateCell(row, col, { value: val, isError: false, isCorrect: true, notes: [] })
    store.setSelectedCell([row, col])
    store.setHighlightedCells(getHighlightedCells(row, col))
    store.incrementHints()
    store.addScore(-5)
    toast.info(`💡 [${row + 1},${col + 1}] = ${val}`, { duration: 1500 })
  }, [store])

  const saveGame = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const state = useGameStore.getState()

      await supabase.from('games').insert({
        user_id: user.id,
        puzzle: state.board.flat().map((c) => (c.isFixed ? (c.value ?? 0) : 0)).join(''),
        solution: state.solution.flat().join(''),
        difficulty: state.difficulty,
        game_mode: state.gameMode,
        completed: true,
        time_seconds: state.timer,
        errors: Math.max(0, 3 - state.lives),
        hints_used: state.hintsUsed,
        score: state.score,
        completed_at: new Date().toISOString(),
      })

      const today = new Date().toISOString().split('T')[0]
      const { data: existing } = await supabase
        .from('user_activity')
        .select('id, puzzles_solved, total_score, total_time_seconds')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (existing) {
        await supabase.from('user_activity').update({
          puzzles_solved: existing.puzzles_solved + 1,
          total_score: existing.total_score + state.score,
          total_time_seconds: existing.total_time_seconds + state.timer,
        }).eq('id', existing.id)
      } else {
        await supabase.from('user_activity').insert({
          user_id: user.id,
          date: today,
          puzzles_solved: 1,
          total_score: state.score,
          total_time_seconds: state.timer,
          difficulty: state.difficulty,
        })
      }

      await supabase.from('profiles').update({
        total_solved: store.score > 0 ? undefined : undefined,
        last_played_at: new Date().toISOString(),
      }).eq('id', user.id)

      const { data: p } = await supabase
        .from('profiles').select('total_solved, total_points, streak').eq('id', user.id).single()
      if (p) {
        await supabase.from('profiles').update({
          total_solved: (p.total_solved || 0) + 1,
          total_points: (p.total_points || 0) + state.score,
          streak: (p.streak || 0) + 1,
        }).eq('id', user.id)
      }
    } catch (e) {
      console.error('saveGame:', e)
    }
  }, [supabase, store])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (store.status !== 'playing') return
      if (e.key >= '1' && e.key <= '9') inputNumber(parseInt(e.key))
      if (e.key === 'Backspace' || e.key === 'Delete') eraseCell()
      if (e.key === 'n' || e.key === 'N') store.toggleNoteMode()
      const { selectedCell } = store
      if (!selectedCell) return
      const [r, c] = selectedCell
      const moves: Record<string, [number, number]> = {
        ArrowUp: [Math.max(0, r - 1), c],
        ArrowDown: [Math.min(8, r + 1), c],
        ArrowLeft: [r, Math.max(0, c - 1)],
        ArrowRight: [r, Math.min(8, c + 1)],
      }
      if (moves[e.key]) { e.preventDefault(); selectCell(...moves[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store, inputNumber, eraseCell, selectCell])

  const formatTime = (s: number): string => {
    if (store.gameMode === 'zen') return '∞'
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return { ...store, startGame, selectCell, inputNumber, eraseCell, useHint, formatTime }
}