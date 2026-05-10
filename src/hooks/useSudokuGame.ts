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
  // ← Отдельный ref для seconds чтобы не было closure problem
  const secondsRef = useRef(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()
  const { setTheme } = useTheme()

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    secondsRef.current = 0
    // ← Ровно 1000ms, функциональное обновление
    timerRef.current = setInterval(() => {
      secondsRef.current += 1
      useGameStore.setState((s) => ({ timer: s.timer + 1 }))
    }, 1000)
  }, [stopTimer])

  useEffect(() => {
    if (store.status === 'playing') {
      startTimer()
    } else {
      stopTimer()
    }
    return () => stopTimer()
  // ← Только status в deps, не startTimer/stopTimer чтобы не было re-subscribe
  }, [store.status])

  // Start game
  const startGame = useCallback(
    (difficulty: Difficulty, mode: GameMode = 'classic') => {
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
      store.setStatus('playing')

      // Zen — infinite lives
      if (mode === 'zen') {
        useGameStore.setState({ lives: 999 })
      }

      const isDev = mode === 'dev'
      const label = isDev
        ? DEV_DIFFICULTY_LABELS[difficulty]
        : { easy: '🌿 Easy', medium: '🔥 Medium', hard: '💀 Hard' }[difficulty]

      toast.success(`${label} started!`, {
        description: mode === 'zen' ? 'No timer. No pressure.' : undefined,
      })
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
          gameMode === 'dev'
            ? '🐛 Cannot modify deployed code!'
            : 'Oops! This cell is already locked 🔒',
          { duration: 1500 }
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
        // Number stays, marked red
        store.updateCell(row, col, {
          value: num,
          isError: true,
          isCorrect: false,
          notes: [],
        })

        if (gameMode === 'zen') {
          toast.info('Not quite, keep trying! 🌊', { duration: 1500 })
          return
        }

        store.loseLife()
        const livesLeft = useGameStore.getState().lives
        toast.error(
          gameMode === 'dev'
            ? `🐛 Bug! ${livesLeft} deployment${livesLeft !== 1 ? 's' : ''} left`
            : `Wrong! ${livesLeft} ${livesLeft === 1 ? 'life' : 'lives'} left ❤️`,
          { duration: 2000 }
        )
        return
      }

      store.updateCell(row, col, {
        value: num, isError: false, isCorrect: true, notes: [],
      })

      // Clear related notes
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

      const points = { easy: 10, medium: 20, hard: 30 }[store.difficulty]
      store.addScore(points)
      toast.success(
        gameMode === 'dev' ? `✅ +${points} XP` : `+${points} ⭐`,
        { duration: 1200 }
      )

      const finalBoard = useGameStore.getState().board
      if (isComplete(finalBoard.map((r) => r.map((c) => c.value)), solution)) {
        store.setStatus('won')
        toast.success(
          gameMode === 'dev' ? '🚀 Deployed successfully!' : '🎉 Puzzle solved!',
          { duration: 4000 }
        )
        saveGame()
      }
    },
    [store]
  )

  const eraseCell = useCallback(() => {
    const { selectedCell, board, gameMode } = store
    if (!selectedCell) return
    const [row, col] = selectedCell
    const cell = board[row][col]
    if (cell.isFixed || cell.isCorrect) {
      toast.info('This cell is locked!', { duration: 1500 })
      return
    }
    store.updateCell(row, col, { value: null, notes: [], isError: false })
  }, [store])

  const useHint = useCallback(() => {
    const { board, solution, status, gameMode } = store
    if (status !== 'playing') return

    const candidates: [number, number][] = []
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = board[r][c]
        if (!cell.isFixed && !cell.isCorrect) candidates.push([r, c])
      }
    }

    if (candidates.length === 0) {
      toast.info('No empty cells!')
      return
    }

    const [row, col] = candidates[Math.floor(Math.random() * candidates.length)]
    const hintValue = solution[row][col]

    store.updateCell(row, col, {
      value: hintValue, isError: false, isCorrect: true, notes: [],
    })
    store.setSelectedCell([row, col])
    store.setHighlightedCells(getHighlightedCells(row, col))
    store.incrementHints()
    store.addScore(-5)

    toast.info(
      gameMode === 'dev'
        ? `💡 [${row + 1},${col + 1}] = ${hintValue} (-5 XP)`
        : `💡 Row ${row + 1}, Col ${col + 1} = ${hintValue} (-5 pts)`
    )
  }, [store])

  const saveGame = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const state = useGameStore.getState()

      // Save game record
      await supabase.from('games').insert({
        user_id: user.id,
        puzzle: state.board.flat().map((c) => (c.isFixed ? (c.value ?? 0) : 0)).join(''),
        solution: state.solution.flat().join(''),
        difficulty: state.difficulty,
        completed: true,
        time_seconds: state.timer,
        errors: 3 - state.lives,
        hints_used: state.hintsUsed,
        completed_at: new Date().toISOString(),
      })

      // Upsert daily activity
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

      // Update profile stats
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
      console.error('Save error:', e)
    }
  }, [supabase])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (store.status !== 'playing') return
      if (e.key >= '1' && e.key <= '9') inputNumber(parseInt(e.key))
      if (e.key === 'Backspace' || e.key === 'Delete') eraseCell()
      if (e.key === 'n' || e.key === 'N') {
        store.toggleNoteMode()
        toast.info(!store.isNoteMode ? '✏️ Notes ON' : 'Notes OFF', { duration: 1000 })
      }
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