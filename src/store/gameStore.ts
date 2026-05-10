import { create } from 'zustand'
import type { SudokuGrid, Difficulty } from '@/lib/sudoku/generator'

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost'
export type GameMode = 'classic' | 'zen' | 'warmup' | 'dev' | 'academy'

export interface CellState {
  value: number | null
  notes: number[]
  isFixed: boolean
  isError: boolean
  isCorrect: boolean // ← новое: заполнена правильно
}

export interface GameStore {
  board: CellState[][]
  solution: SudokuGrid
  difficulty: Difficulty
  gameMode: GameMode
  status: GameStatus
  lives: number
  maxLives: number
  score: number
  timer: number
  hintsUsed: number
  selectedCell: [number, number] | null
  isNoteMode: boolean
  highlightedCells: Set<string>
  selectedNumber: number | null
  tutorialSeen: boolean

  setBoard: (board: CellState[][]) => void
  setSolution: (solution: SudokuGrid) => void
  setDifficulty: (difficulty: Difficulty) => void
  setGameMode: (mode: GameMode) => void
  setStatus: (status: GameStatus) => void
  setSelectedCell: (cell: [number, number] | null) => void
  setSelectedNumber: (num: number | null) => void
  toggleNoteMode: () => void
  loseLife: () => void
  addScore: (points: number) => void
  incrementTimer: () => void
  incrementHints: () => void
  resetGame: () => void
  updateCell: (row: number, col: number, update: Partial<CellState>) => void
  setHighlightedCells: (cells: Set<string>) => void
  setTutorialSeen: (seen: boolean) => void
}

const emptyBoard = (): CellState[][] =>
  Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => ({
      value: null,
      notes: [],
      isFixed: false,
      isError: false,
      isCorrect: false,
    }))
  )

export const useGameStore = create<GameStore>((set) => ({
  board: emptyBoard(),
  solution: Array.from({ length: 9 }, () => Array(9).fill(null)),
  difficulty: 'easy',
  gameMode: 'classic',
  status: 'idle',
  lives: 3,
  maxLives: 3,
  score: 0,
  timer: 0,
  hintsUsed: 0,
  selectedCell: null,
  isNoteMode: false,
  highlightedCells: new Set(),
  selectedNumber: null,
  tutorialSeen: false,

  setBoard: (board) => set({ board }),
  setSolution: (solution) => set({ solution }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setGameMode: (gameMode) => set({ gameMode }),
  setStatus: (status) => set({ status }),
  setSelectedCell: (selectedCell) => set({ selectedCell }),
  setSelectedNumber: (selectedNumber) => set({ selectedNumber }),
  toggleNoteMode: () => set((s) => ({ isNoteMode: !s.isNoteMode })),
  loseLife: () =>
    set((s) => {
      const newLives = s.lives - 1
      return {
        lives: newLives,
        status: newLives <= 0 ? 'lost' : s.status,
      }
    }),
  addScore: (points) => set((s) => ({ score: s.score + points })),
  incrementTimer: () => set((s) => ({ timer: s.timer + 1 })),
  incrementHints: () => set((s) => ({ hintsUsed: s.hintsUsed + 1 })),
  setTutorialSeen: (tutorialSeen) => set({ tutorialSeen }),
  resetGame: () =>
    set({
      board: emptyBoard(),
      solution: Array.from({ length: 9 }, () => Array(9).fill(null)),
      status: 'idle',
      lives: 3,
      score: 0,
      timer: 0,
      hintsUsed: 0,
      selectedCell: null,
      isNoteMode: false,
      highlightedCells: new Set(),
      selectedNumber: null,
    }),
  updateCell: (row, col, update) =>
    set((s) => {
      const newBoard = s.board.map((r) => r.map((c) => ({ ...c })))
      newBoard[row][col] = { ...newBoard[row][col], ...update }
      return { board: newBoard }
    }),
  setHighlightedCells: (highlightedCells) => set({ highlightedCells }),
}))

export type { Difficulty }