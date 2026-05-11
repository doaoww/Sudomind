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
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // ── Timer ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (store.status === 'playing') {
      clearGlobalInterval()

      globalInterval = setInterval(() => {
        if (!mountedRef.current) { clearGlobalInterval(); return }

        const state = useGameStore.getState()
        if (state.status !== 'playing') { clearGlobalInterval(); return }

        if (state.gameMode === 'warmup' && state.timeLeft !== null) {
          useGameStore.getState().decrementTimeLeft()
        } else if (state.gameMode !== 'zen') {
          useGameStore.setState((prev) => ({ timer: prev.timer + 1 }))
        }
      }, 1000)
    } else {
      clearGlobalInterval()
    }

    return () => { clearGlobalInterval() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status])

  // ── Timeout handler ────────────────────────────────────────────────────
  useEffect(() => {
    if (store.status === 'timeout') {
      toast.error('⏰ Time is up! Brain warm-up failed.', { duration: 3000 })
      saveGame()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.status])

  // ── startGame ──────────────────────────────────────────────────────────
  const startGame = useCallback(
    (difficulty: Difficulty, mode: GameMode = 'classic', silent = false) => {
      clearGlobalInterval()
      store.resetGame()
      store.setDifficulty(difficulty)
      store.setGameMode(mode)

      if (mode === 'dev') setTheme('nfactorial')

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

      if (mode === 'zen') {
        useGameStore.setState({ lives: 999, maxLives: 999, timeLeft: null })
      } else if (mode === 'warmup') {
        useGameStore.setState({ lives: 3, maxLives: 3, timeLeft: 180 })
      } else if (mode === 'academy') {
        useGameStore.setState({ lives: 999, maxLives: 999, timeLeft: null })
      } else {
        useGameStore.setState({ lives: 3, maxLives: 3, timeLeft: null })
      }

      store.setStatus('playing')

      if (!silent) {
        const label = mode === 'dev'
          ? DEV_DIFFICULTY_LABELS[difficulty]
          : { easy: '🌿 Easy', medium: '🔥 Medium', hard: '💀 Hard' }[difficulty]
        const modePrefix: Record<GameMode, string> = {
          classic: '', zen: '🌊 Zen · ', warmup: '☀️ Warm-up · ',
          dev: '⚡ Dev · ', academy: '🎓 Academy · ', daily: '📅 Daily · ',
        }
        toast.success(`${modePrefix[mode]}${label}`, { duration: 1500 })
      }
    },
    [store, setTheme]
  )

  // ── selectCell ─────────────────────────────────────────────────────────
  const selectCell = useCallback((row: number, col: number) => {
    store.setSelectedCell([row, col])
    store.setHighlightedCells(getHighlightedCells(row, col))
    const val = store.board[row][col].value
    if (val) store.setSelectedNumber(val)
  }, [store])

  // ── inputNumber ────────────────────────────────────────────────────────
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

      if (gameMode === 'academy') {
        toast.error('🎓 Incorrect! Ask Prof. Sana to explain why.', { duration: 2500 })
        return
      }

      if (gameMode === 'zen') {
        toast.info('Keep going! 🌊', { duration: 800 })
        return
      }

      store.loseLife()
      const livesLeft = useGameStore.getState().lives
      const msg = gameMode === 'dev'
        ? `🐛 Bug detected! ${livesLeft} deployment attempts left`
        : `Wrong! ${livesLeft} ❤️ left`
      toast.error(msg, { duration: 1500 })
      return
    }

    store.updateCell(row, col, { value: num, isError: false, isCorrect: true, notes: [] })

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

    const finalBoard = useGameStore.getState().board
    if (isComplete(finalBoard.map((r) => r.map((c) => c.value)), solution)) {
      clearGlobalInterval()
      store.setStatus('won')
      const winMsg = store.gameMode === 'dev' ? '🚀 Deployed to production!' : '🎉 Puzzle solved!'
      toast.success(winMsg, { duration: 3000 })
      saveGame()
    }
  }, [store])

  // ── eraseCell ──────────────────────────────────────────────────────────
  const eraseCell = useCallback(() => {
    const { selectedCell, board } = store
    if (!selectedCell) return
    const [row, col] = selectedCell
    const cell = board[row][col]
    if (cell.isFixed || cell.isCorrect) return
    store.updateCell(row, col, { value: null, notes: [], isError: false })
  }, [store])

  // ── useHint ────────────────────────────────────────────────────────────
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

    const hintMsg = store.gameMode === 'dev'
      ? `🔍 Debug: [${row + 1},${col + 1}] = ${val}`
      : `💡 [${row + 1},${col + 1}] = ${val}`
    toast.info(hintMsg, { duration: 1500 })
  }, [store])

  // ── saveGame ───────────────────────────────────────────────────────────
  // Inserts ONE row into game_history.
  // The Postgres trigger handle_game_completed() (from sudomind_fix.sql)
  // automatically handles:
  //   • profiles.total_solved  ++ (wins only)
  //   • profiles.total_points  += score
  //   • profiles.streak        recalculated correctly
  //   • user_activity          upserted for today (feeds dashboard chart)
  const saveGame = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const state = useGameStore.getState()

      const { error } = await supabase.from('game_history').insert({
        user_id:    user.id,
        mode:       state.gameMode,
        difficulty: state.difficulty,
        score:      state.score,
        time_secs:  state.timer,
        completed:  state.status === 'won',   // trigger only counts completed=true
      })

      if (error) {
        // Silent fail — game already happened, don't show error to user
        console.error('[saveGame] Failed to insert game_history:', error.message)
      }
    } catch (e) {
      console.error('[saveGame] Unexpected error:', e)
    }
  }, [supabase])

  // ── Keyboard handler ───────────────────────────────────────────────────
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
        ArrowUp:    [Math.max(0, r - 1), c],
        ArrowDown:  [Math.min(8, r + 1), c],
        ArrowLeft:  [r, Math.max(0, c - 1)],
        ArrowRight: [r, Math.min(8, c + 1)],
      }
      if (moves[e.key]) { e.preventDefault(); selectCell(...moves[e.key]) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [store, inputNumber, eraseCell, selectCell])

  // ── formatTime ─────────────────────────────────────────────────────────
  const formatTime = useCallback((s: number): string => {
    const mode = useGameStore.getState().gameMode
    if (mode === 'zen') return '∞'
    const m = Math.floor(s / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${m}:${sec}`
  }, [])

  return { ...store, startGame, selectCell, inputNumber, eraseCell, useHint, formatTime }
}

