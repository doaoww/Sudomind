'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, X, CheckCircle } from 'lucide-react'
import { useGameStore } from '@/store/gameStore'

const steps = [
  {
    title: 'Welcome to Sudomind! 🧠',
    desc: 'Fill the 9×9 grid so every row, column, and 3×3 box contains numbers 1-9 without repeating.',
    emoji: '🎯',
  },
  {
    title: 'You Have 3 Lives ❤️',
    desc: 'If you place a wrong number, you lose a life. The number stays in the cell — erase it and try again!',
    emoji: '❤️',
  },
  {
    title: 'Click a Cell, Then a Number',
    desc: 'Select any empty cell by clicking it. Then tap a number from the pad below — or use your keyboard!',
    emoji: '👆',
  },
  {
    title: 'Notes Mode ✏️',
    desc: 'Activate Notes (pencil icon) to write small candidate numbers inside a cell. Press N on keyboard to toggle.',
    emoji: '✏️',
  },
  {
    title: 'AI Coach is Here 🤖',
    desc: 'Stuck? Click "Get AI Hint" in the right panel. Sana AI will analyze your board and give strategic advice.',
    emoji: '🤖',
  },
  {
    title: 'You\'re Ready! 🚀',
    desc: 'Start with Easy mode and work your way up. Good luck, and train that brain!',
    emoji: '🚀',
  },
]

export function TutorialModal() {
  const [show, setShow] = useState(false)
  const [step, setStep] = useState(0)
  const { tutorialSeen, setTutorialSeen } = useGameStore()

  useEffect(() => {
    const seen = localStorage.getItem('sudomind-tutorial-seen')
    if (!seen) {
      setTimeout(() => setShow(true), 800)
    }
  }, [])

  const handleSkip = () => {
    localStorage.setItem('sudomind-tutorial-seen', 'true')
    setTutorialSeen(true)
    setShow(false)
  }

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      handleSkip()
    }
  }

  const currentStep = steps[step]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(20px)', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="glass clay-lg rounded-3xl p-8 max-w-sm w-full text-center relative"
          >
            {/* Close */}
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Step indicator */}
            <div className="flex justify-center gap-1.5 mb-6">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-5xl mb-4">{currentStep.emoji}</div>
                <h2 className="text-xl font-black mb-3">{currentStep.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {currentStep.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 rounded-2xl glass text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip Tutorial
              </button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {step === steps.length - 1 ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Let's Play!
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}