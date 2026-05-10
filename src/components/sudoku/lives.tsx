'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Heart } from 'lucide-react'

interface LivesProps {
  lives: number
  maxLives: number
}

export function Lives({ lives, maxLives }: LivesProps) {
  return (
    <div className="flex items-center gap-1.5">
      <AnimatePresence mode="popLayout">
        {Array.from({ length: maxLives }, (_, i) => {
          const isAlive = i < lives
          return (
            <motion.div
              key={i}
              initial={{ scale: 1 }}
              animate={isAlive ? { scale: 1 } : { scale: [1, 1.4, 0.8, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  isAlive
                    ? 'fill-red-500 text-red-500'
                    : 'fill-muted text-muted-foreground opacity-30'
                }`}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}