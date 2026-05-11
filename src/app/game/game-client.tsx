'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Timer, Pause, Play, Brain, CalendarDays, Sunrise, Code2, Waves, GraduationCap, ArrowRight } from 'lucide-react'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { GlobalNavbar } from '@/components/layout/global-navbar'
import { SudokuBoard } from '@/components/sudoku/board'
import { AICoach } from '@/components/sudoku/ai-coach'
import { NumberPad, ActionButtons, GameControls } from '@/components/sudoku/controls'
import { GameOverModal } from '@/components/sudoku/game-over-modal'
import { TutorialModal } from '@/components/sudoku/tutorial-modal'
import { Lives } from '@/components/sudoku/lives'
import { useSudokuGame } from '@/hooks/useSudokuGame'
import { cn } from '@/lib/utils'
import type { GameMode } from '@/store/gameStore'
import type { Difficulty } from '@/lib/sudoku/generator'

// ── Mode definitions ────────────────────────────────────────────────────────
const MODES: {
  id: GameMode
  icon: React.ReactNode
  title: string
  desc: string
  color: string
  badge: string | null
  difficulties: Difficulty[]
}[] = [
  {
    id: 'classic',
    icon: <Brain className="w-6 h-6" />,
    title: 'Classic',
    desc: '3 lives · Standard rules · Pick your difficulty',
    color: 'text-primary bg-primary/10',
    badge: null,
    difficulties: ['easy', 'medium', 'hard'],
  },
  {
    id: 'daily',
    icon: <CalendarDays className="w-6 h-6" />,
    title: 'Daily Challenge',
    desc: 'Same puzzle for everyone today',
    color: 'text-green-600 bg-green-500/10',
    badge: '🔥 Live',
    difficulties: ['medium'],
  },
  {
    id: 'warmup',
    icon: <Sunrise className="w-6 h-6" />,
    title: 'Brain Warm-up',
    desc: '3 min timer · Easy · Wake your brain',
    color: 'text-orange-500 bg-orange-500/10',
    badge: '⚡ Quick',
    difficulties: ['easy'],
  },
  {
    id: 'dev',
    icon: <Code2 className="w-6 h-6" />,
    title: 'Developer Mode',
    desc: 'O(n²) · Bugs · Deploy to win',
    color: 'text-red-600 bg-red-500/10',
    badge: 'nFactorial',
    difficulties: ['easy', 'medium', 'hard'],
  },
  {
    id: 'zen',
    icon: <Waves className="w-6 h-6" />,
    title: 'Zen Mode',
    desc: 'No timer · No lives · Just flow',
    color: 'text-blue-500 bg-blue-500/10',
    badge: '🌊 Relax',
    difficulties: ['easy', 'medium', 'hard'],
  },
  {
    id: 'academy',
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Academy',
    desc: 'AI-guided · No penalties · Learn techniques',
    color: 'text-purple-500 bg-purple-500/10',
    badge: '📚 Learn',
    difficulties: ['easy', 'medium'],
  },
]

const DIFFICULTY_META: Record<Difficulty, { label: string; color: string; desc: string }> = {
  easy:   { label: 'Easy',   color: 'text-green-500  border-green-500/40  bg-green-500/10',  desc: '~35 clues · Beginner friendly' },
  medium: { label: 'Medium', color: 'text-yellow-500 border-yellow-500/40 bg-yellow-500/10', desc: '~27 clues · Balanced challenge' },
  hard:   { label: 'Hard',   color: 'text-red-500    border-red-500/40    bg-red-500/10',    desc: '~22 clues · For experts' },
}

// ── Mode Selector ────────────────────────────────────────────────────────────
function ModeSelector({ onSelect }: { onSelect: (mode: GameMode, difficulty: Difficulty) => void }) {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null)
  const [selectedDiff, setSelectedDiff] = useState<Difficulty>('medium')

  const chosen = MODES.find((m) => m.id === selectedMode)

  const handleStart = () => {
    if (!selectedMode) return
    const diff = chosen!.difficulties.includes(selectedDiff)
      ? selectedDiff
      : chosen!.difficulties[0]
    onSelect(selectedMode, diff)
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 md:pb-6">
      <ThemeBackground />
      <div className="relative z-10">
        <GlobalNavbar />
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-2xl md:text-3xl font-black">Choose Your Mode</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Pick a game mode, then select difficulty to start
            </p>
          </motion.div>

          {/* Mode grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {MODES.map((mode, i) => (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedMode(mode.id)
                  if (!mode.difficulties.includes(selectedDiff)) {
                    setSelectedDiff(mode.difficulties[0])
                  }
                }}
                className={cn(
                  'glass clay rounded-2xl p-4 text-left block transition-all',
                  selectedMode === mode.id
                    ? 'ring-2 ring-primary shadow-lg shadow-primary/20'
                    : 'hover:shadow-lg'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn('p-2 rounded-xl', mode.color)}>{mode.icon}</div>
                  {mode.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {mode.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm mb-0.5">{mode.title}</h3>
                <p className="text-xs text-muted-foreground">{mode.desc}</p>
                {selectedMode === mode.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-2 flex items-center gap-1 text-xs text-primary font-semibold"
                  >
                    Selected ✓
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>

          {/* Difficulty selector — only shown when a mode is selected */}
          <AnimatePresence>
            {selectedMode && chosen && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="glass clay-lg rounded-3xl p-5 mb-5"
              >
                <h2 className="font-bold mb-3">
                  {chosen.difficulties.length === 1
                    ? `Difficulty: ${DIFFICULTY_META[chosen.difficulties[0]].label} (fixed for this mode)`
                    : 'Select Difficulty'}
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
                    const meta = DIFFICULTY_META[d]
                    const available = chosen.difficulties.includes(d)
                    return (
                      <button
                        key={d}
                        disabled={!available}
                        onClick={() => setSelectedDiff(d)}
                        className={cn(
                          'rounded-2xl border p-3 text-left transition-all',
                          !available && 'opacity-30 cursor-not-allowed',
                          available && selectedDiff === d
                            ? `${meta.color} ring-2 ring-offset-0`
                            : available
                              ? 'glass hover:bg-accent'
                              : ''
                        )}
                      >
                        <p className={cn('font-bold text-sm', available && meta.color.split(' ')[0])}>
                          {meta.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{meta.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start button */}
          <AnimatePresence>
            {selectedMode && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-4 font-black text-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/30"
              >
                Start Game <ArrowRight className="w-5 h-5" />
              </motion.button>
            )}
          </AnimatePresence>

        </main>
      </div>
    </div>
  )
}

// ── Game Client ──────────────────────────────────────────────────────────────
interface GameClientProps {
  profile?: any
  userId?: string
  gameMode?: string
  initialDifficulty?: string
}

export function GameClient({ gameMode: initialMode, initialDifficulty }: GameClientProps) {
  const router = useRouter()
  const {
    status, score, timer, timeLeft, difficulty,
    startGame, gameMode, lives, maxLives, formatTime,
    isNoteMode, isPaused, togglePause,
  } = useSudokuGame()

  const hasStarted = useRef(false)
  // null = show selector, otherwise we have a chosen mode
  const [chosenMode, setChosenMode] = useState<GameMode | null>(
    (initialMode as GameMode) ?? null
  )

  // If mode came from URL (e.g. /game?mode=zen), auto-start
  useEffect(() => {
    if (hasStarted.current) return
    if (!chosenMode) return         // waiting for user to pick
    hasStarted.current = true
    const diff = (initialDifficulty as any) ?? 'easy'
    startGame(diff, chosenMode, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chosenMode])

  // Handler from ModeSelector
  const handleModeSelect = (mode: GameMode, diff: import('@/lib/sudoku/generator').Difficulty) => {
    hasStarted.current = true
    setChosenMode(mode)
    startGame(diff, mode, false)
  }

  // Show selector if no mode chosen yet
  if (!chosenMode) {
    return <ModeSelector onSelect={handleModeSelect} />
  }

  const isWarmup  = gameMode === 'warmup'
  const isZen     = gameMode === 'zen'
  const isDev     = gameMode === 'dev'
  const isAcademy = gameMode === 'academy'

  const labels = {
    score: isDev ? 'Experience' : 'Score',
    lives: isDev ? 'Deploys'    : 'Lives',
  }

  const canPause = !isZen && (status === 'playing' || status === 'paused')

  return (
    <div className="min-h-screen relative overflow-hidden pb-16 md:pb-0">
      <ThemeBackground />
      <div className="relative z-10">
        <GlobalNavbar />

        <GameOverModal
          status={status}
          score={score}
          timer={timer}
          difficulty={difficulty}
          onRestart={(d) => startGame(d, gameMode)}
        />
        <TutorialModal />

        <main className="px-3 py-3 md:px-5 md:py-4">
          <div className="max-w-[1400px] mx-auto">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => {
                  hasStarted.current = false
                  setChosenMode(null)
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Modes</span>
              </button>

              {/* Mode badge */}
              <div className="flex items-center gap-2">
                {isWarmup && (
                  <div className="flex items-center gap-2 glass rounded-2xl px-4 py-1.5">
                    <Timer className="w-4 h-4 text-orange-500" />
                    <span className={cn(
                      'font-mono font-black text-sm',
                      (timeLeft ?? 180) < 60 ? 'text-red-500 animate-pulse' : 'text-orange-500'
                    )}>
                      {formatTime(timeLeft ?? 180)}
                    </span>
                    <span className="text-xs text-muted-foreground">Brain Warm-up</span>
                  </div>
                )}
                {isZen && (
                  <div className="glass rounded-2xl px-4 py-1.5 text-sm text-blue-400 font-semibold">
                    🌊 Zen Mode — No pressure
                  </div>
                )}
                {isDev && (
                  <div className="glass rounded-2xl px-4 py-1.5 text-sm text-red-500 font-mono font-bold">
                    ⚡ Developer Mode
                  </div>
                )}
                {isAcademy && (
                  <div className="glass rounded-2xl px-4 py-1.5 text-sm text-purple-500 font-semibold">
                    📚 Academy Mode
                  </div>
                )}
              </div>

              {/* Pause */}
              {canPause ? (
                <button
                  onClick={togglePause}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              ) : (
                <div className="w-[80px]" />
              )}
            </div>

            {/* Difficulty selector */}
            <div className="flex justify-center mb-4">
              <GameControls />
            </div>

            {/* Main layout */}
            <div className="flex flex-col xl:flex-row items-start justify-center gap-4 xl:gap-5">

              {/* BOARD */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center gap-4 w-full xl:flex-1 xl:max-w-[700px]"
              >
                <div className="relative w-full">
                  <SudokuBoard />

                  <AnimatePresence>
                    {isPaused && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl"
                        style={{ backdropFilter: 'blur(16px)', backgroundColor: 'rgba(0,0,0,0.65)' }}
                      >
                        <p className="text-5xl mb-3">⏸️</p>
                        <p className="text-xl font-black text-white mb-1">Game Paused</p>
                        <p className="text-sm text-white/60 mb-5">Board hidden · Take your time</p>
                        <button
                          onClick={togglePause}
                          className="flex items-center gap-2 bg-primary text-primary-foreground rounded-2xl px-6 py-3 font-semibold hover:opacity-90 transition-opacity"
                        >
                          <Play className="w-4 h-4" /> Resume
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Mobile controls */}
                <div className="xl:hidden flex flex-col items-center gap-4 w-full max-w-[580px]">
                  <ActionButtons className="justify-center" />
                  <div className="glass clay rounded-2xl p-3 w-full">
                    <NumberPad />
                  </div>
                  {!isZen && (
                    <div className="flex items-center gap-4 glass rounded-2xl px-4 py-2">
                      <Lives lives={lives} maxLives={maxLives} />
                      <div className="w-px h-4 bg-border" />
                      <span className="text-sm text-muted-foreground">
                        {isDev ? `${score} XP` : `${score} pts`}
                      </span>
                      {!isWarmup && (
                        <>
                          <div className="w-px h-4 bg-border" />
                          <span className="font-mono text-sm">{formatTime(timer)}</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* RIGHT SIDEBAR */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="hidden xl:flex flex-col gap-3 w-[270px] flex-shrink-0"
              >
                <div className="glass clay rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {isDev ? 'Session Stats' : 'Game Stats'}
                    </p>
                    {!isZen && (
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        isWarmup && (timeLeft ?? 180) < 60 ? 'text-red-500 animate-pulse' : 'text-foreground'
                      )}>
                        {isWarmup ? formatTime(timeLeft ?? 180) : formatTime(timer)}
                      </span>
                    )}
                    {isZen && <span className="text-blue-400 text-sm font-semibold">∞</span>}
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{labels.score}</span>
                    <span className="font-black text-primary">
                      {isDev ? `${score} XP` : `${score} pts`}
                    </span>
                  </div>

                  {!isZen && !isAcademy && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">{labels.lives}</span>
                      <Lives lives={lives} maxLives={maxLives} />
                    </div>
                  )}
                  {isZen && (
                    <div className="flex items-center justify-center pt-2">
                      <span className="text-blue-400 text-sm">No limits · Just flow 🌊</span>
                    </div>
                  )}
                  {isAcademy && (
                    <div className="flex items-center justify-center pt-2">
                      <span className="text-purple-400 text-sm">📚 Learning mode · No penalties</span>
                    </div>
                  )}
                </div>

                <div className="glass clay rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Numbers</p>
                    {isNoteMode && (
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                        ✏️ Notes ON
                      </span>
                    )}
                  </div>
                  <NumberPad />
                </div>

                <div className="glass clay rounded-2xl p-3">
                  <ActionButtons className="justify-between" />
                </div>

                <div className="flex-1">
                  <AICoach />
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}