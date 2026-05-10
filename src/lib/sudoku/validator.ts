import type { SudokuGrid } from './generator'

export function validateCell(
  puzzle: SudokuGrid,
  solution: SudokuGrid,
  row: number,
  col: number,
  value: number
): boolean {
  return solution[row][col] === value
}

export function isComplete(puzzle: SudokuGrid, solution: SudokuGrid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzle[r][c] !== solution[r][c]) return false
    }
  }
  return true
}

export function getHighlightedCells(row: number, col: number): Set<string> {
  const cells = new Set<string>()
  for (let i = 0; i < 9; i++) {
    cells.add(`${row}-${i}`)
    cells.add(`${i}-${col}`)
  }
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      cells.add(`${r}-${c}`)
    }
  }
  return cells
}