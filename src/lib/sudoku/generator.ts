export type Difficulty = 'easy' | 'medium' | 'hard'

export type SudokuGrid = (number | null)[][]

function isValid(grid: SudokuGrid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false
    if (grid[i][col] === num) return false
    const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3)
    const boxCol = 3 * Math.floor(col / 3) + (i % 3)
    if (grid[boxRow][boxCol] === num) return false
  }
  return true
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function solve(grid: SudokuGrid): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num
            if (solve(grid)) return true
            grid[row][col] = null
          }
        }
        return false
      }
    }
  }
  return true
}

function countSolutions(grid: SudokuGrid, limit = 2): number {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === null) {
        let count = 0
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num
            count += countSolutions(grid, limit - count)
            grid[row][col] = null
            if (count >= limit) return count
          }
        }
        return count
      }
    }
  }
  return 1
}

export function generatePuzzle(difficulty: Difficulty): { puzzle: SudokuGrid; solution: SudokuGrid } {
  const solution: SudokuGrid = Array.from({ length: 9 }, () => Array(9).fill(null))
  solve(solution)

  const puzzle: SudokuGrid = solution.map(row => [...row])

  const cellsToRemove = { easy: 36, medium: 46, hard: 54 }[difficulty]
  const positions = shuffle(Array.from({ length: 81 }, (_, i) => i))

  let removed = 0
  for (const pos of positions) {
    if (removed >= cellsToRemove) break
    const row = Math.floor(pos / 9)
    const col = pos % 9
    const backup = puzzle[row][col]
    puzzle[row][col] = null

    const testGrid = puzzle.map(r => [...r])
    if (countSolutions(testGrid) !== 1) {
      puzzle[row][col] = backup
    } else {
      removed++
    }
  }

  return { puzzle, solution }
}

export function gridToString(grid: SudokuGrid): string {
  return grid.flat().map(n => n ?? 0).join('')
}

export function stringToGrid(str: string): SudokuGrid {
  const nums = str.split('').map(Number)
  return Array.from({ length: 9 }, (_, i) =>
    Array.from({ length: 9 }, (_, j) => nums[i * 9 + j] || null)
  )
}