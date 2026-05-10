import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const {
    board, selectedCell, difficulty, gameMode,
    errorCells, emptyCellsCount, analysisHints,
  } = await req.json()

  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const isDev = gameMode === 'dev'
  const diffLabel = isDev
    ? { easy: 'O(log n)', medium: 'O(n)', hard: 'O(n²)' }[difficulty as string] ?? difficulty
    : difficulty

  const boardContext = analysisHints.length > 0
    ? `Key observations:\n${analysisHints.map((h: string) => `- ${h}`).join('\n')}`
    : 'No immediate single-missing observations found.'

  const prompt = isDev
    ? `You are a senior developer reviewing a Sudoku algorithm (difficulty: ${diffLabel}).
Current board state (0 = empty):
${board}

${boardContext}

${errorCells.length > 0 ? `Bugs found at: ${errorCells.join(', ')}` : 'No bugs yet.'}
Empty cells remaining: ${emptyCellsCount}

Give a SHORT code-review style hint (2-3 sentences). Use developer language:
- Call mistakes "bugs" or "edge cases"
- Call rows/columns "arrays" or "indices" 
- Suggest the next "optimization"
Do NOT reveal the answer directly. Be specific about which row/column/box to check.`
    : `You are Sana, an expert Sudoku coach. Be encouraging and educational.

Current Sudoku board (0 = empty, numbers given):
${board}

${boardContext}

${errorCells.length > 0 ? `The player has wrong numbers at: ${errorCells.join(', ')}` : ''}
Empty cells remaining: ${emptyCellsCount}
Difficulty: ${diffLabel}
${selectedCell ? `Player is looking at Row ${selectedCell[0] + 1}, Column ${selectedCell[1] + 1}` : ''}

Give a SHORT, SPECIFIC hint (2-3 sentences) that:
1. Points to a SPECIFIC row, column, or 3×3 box (use the analysis observations above if available)
2. Names the technique (Hidden Single, Naked Pair, Box/Line Reduction)
3. Is encouraging

IMPORTANT: Use the "Key observations" above if they exist — they are real analysis of the board.
Do NOT reveal the exact number. Be specific with coordinates.`

  try {
    const result = await model.generateContent(prompt)
    const hint = result.response.text().trim()
    return NextResponse.json({ hint })
  } catch (err) {
    const fallback = analysisHints.length > 0
      ? analysisHints[0]
      : 'Look for rows, columns, or boxes with only one empty cell — those are the easiest to solve!'
    return NextResponse.json({ hint: fallback })
  }
}