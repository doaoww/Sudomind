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

export function useSudokuGame() {
  const store = useGameStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // ← Ключевой фикс: храним актуальный статус в ref чтобы избежать stale closure
  const statusRef = useRef(store.status)
  const supabase = createClient()
  const { setTheme } = useTheme()

  // Sync statusRef with store
  useEffect(() => {
    statusRef.current = store.status
  }, [store.status])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // ← Таймер запускается ОДИН раз при статусе playing
  // Использует setState с функцией чтобы не было stale closure
  useEffect(() => {
    if (store.status === 'playing') {
      // Сначала останавливаем предыдущий если был
      stopTimer()
      timerRef.current = setInterval(() => {
        // Functional update — не зависит от замыкания
        useGameStore.setState((prev) => ({ timer: prev.timer + 1 }))
      }, 1000)
    } else {
      stopTimer()
    }

    return () => {
      stopTimer()
    }
  // ← ТОЛЬКО store.status в зависимостях — не stopTimer, не store
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status])

  const startGame = useCallback(
    (difficulty: Difficulty, mode: GameMode = 'classic', silent = false) => {
      // Останавливаем таймер до сброса
      stopTimer()
      store.resetGame()
      store.setDifficulty(difficulty)
      store.setGameMode(mode)

      if (mode === 'dev') setTheme('nfactorial')

      const { puzzle, solution } = generatePuzzle(difficulty)
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

      if (mode === 'zen') {
        useGameStore.setState({ lives: 999 })
      }

      // ← setStatus ПОСЛЕ всего — это триггерит useEffect таймера
      store.setStatus('playing')

      // ← silent = true при автостарте, чтобы не было двойного toast
      if (!silent) {
        const label =
          mode === 'dev'
            ? DEV_DIFFICULTY_LABELS[difficulty]
            : { easy: '🌿 Easy', medium: '🔥 Medium', hard: '💀 Hard' }[difficulty]
        toast.success(`${label}`, { duration: 1200 })
      }
    },
    [store, setTheme, stopTimer]
  )

  const selectCell = useCallback(
    (row: number, col: number) => {
      store.setSelectedCell([row, col])
      store.setHighlightedCells(getHighlightedCells(row, col))
      const cellValue = store.board[row][col].value
      if (cellValue) store.setSelectedNumber(cellValue)
    },
    [store]
  )

  const inputNumber = useCallback(
    (num: number) => {
      const { selectedCell, board, solution, isNoteMode, status, gameMode } = store
      if (!selectedCell || status !== 'playing') return

      const [row, col] = selectedCell
      const cell = board[row][col]

      if (cell.isFixed || cell.isCorrect) {
        toast.info(
          gameMode === 'dev' ? '🐛 Cannot modify deployed code!' : 'Cell is locked 🔒',
          { duration: 1200 }
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
        solution,
        row,
        col,
        num
      )

      if (!correct) {
        store.updateCell(row, col, {
          value: num, isError: true, isCorrect: false, notes: [],
        })

        if (gameMode === 'zen') {
          toast.info('Keep trying! 🌊', { duration: 1000 })
          return
        }

        store.loseLife()
        const livesLeft = useGameStore.getState().lives
        toast.error(
          gameMode === 'dev'
            ? `🐛 Bug! ${livesLeft} deploys left`
            : `Wrong! ${livesLeft} ❤️ left`,
          { duration: 1800 }
        )
        return
      }

      store.updateCell(row, col, {
        value: num, isError: false, isCorrect: true, notes: [],
      })

      // Clear notes in related cells
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
      toast.success(
        gameMode === 'dev' ? `✅ +${pts} XP` : `+${pts} ⭐`,
        { duration: 900 }
      )

      const finalBoard = useGameStore.getState().board
      if (isComplete(finalBoard.map((r) => r.map((c) => c.value)), solution)) {
        store.setStatus('won')
        toast.success(
          gameMode === 'dev' ? '🚀 Deployed!' : '🎉 Solved!',
          { duration: 3000 }
        )
        saveGame()
      }
    },
    [store]
  )

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
        if (!board[r][c].isFixed && !board[r][c].isCorrect) {
          candidates.push([r, c])
        }
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
    toast.info(`💡 [${row + 1},${col + 1}] = ${val} (-5)`, { duration: 2000 })
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
        completed: true,
        time_seconds: state.timer,
        errors: Math.max(0, 3 - state.lives),
        hints_used: state.hintsUsed,
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('total_solved, total_points, streak')
        .eq('id', user.id)
        .single()

      if (profile) {
        await supabase.from('profiles').update({
          total_solved: (profile.total_solved || 0) + 1,
          total_points: (profile.total_points || 0) + state.score,
          streak: (profile.streak || 0) + 1,
          last_played_at: new Date().toISOString(),
        }).eq('id', user.id)
      }
    } catch (e) {
      console.error('saveGame error:', e)
    }
  }, [supabase])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (store.status !== 'playing') return
      if (e.key >= '1' && e.key <= '9') inputNumber(parseInt(e.key))
      if (e.key === 'Backspace' || e.key === 'Delete') eraseCell()
      if (e.key === 'n' || e.key === 'N') store.toggleNoteMode()
      const { selectedCell } = store
      if (!selectedCell) return
      const [row, col] = selectedCell
      const moves: Record<string, [number, number]> = {
        ArrowUp: [Math.max(0, row - 1), col],
        ArrowDown: [Math.min(8, row + 1), col],
        ArrowLeft: [row, Math.max(0, col - 1)],
        ArrowRight: [row, Math.min(8, col + 1)],
      }
      if (moves[e.key]) {
        e.preventDefault()
        selectCell(...moves[e.key])
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store, inputNumber, eraseCell, selectCell])

  const formatTime = (s: number) => {
    if (store.gameMode === 'zen') return '∞'
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }

  return {
    ...store,
    startGame,
    selectCell,
    inputNumber,
    eraseCell,
    useHint,
    formatTime,
  }
}