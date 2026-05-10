'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Brain, Zap, Trophy, ArrowRight, Sparkles } from 'lucide-react'

const badges = [
  { icon: '🧠', text: 'AI Coach' },
  { icon: '❤️', text: '3 Lives System' },
  { icon: '🏆', text: 'Almaty Ranked' },
  { icon: '⚡', text: 'Developer Mode' },
]

export function Hero() {
  return (
    <section className="min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 text-center">
      {/* Floating badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium mb-8 border border-primary/20"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        <span>Powered by Gemini AI · Built for nFactorial</span>
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
        className="text-5xl md:text-7xl font-black leading-tight tracking-tight mb-6 max-w-4xl"
      >
        Brain Fitness
        <br />
        <span className="text-primary">for the Next Gen</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed"
      >
        The world's smartest Sudoku platform. Train your brain with AI coaching,
        compete with Almaty's best, and unlock your cognitive potential — one puzzle at a time.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 mb-14"
      >
        <Link
          href="/auth/login"
          className="group flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:scale-105 shadow-lg"
        >
          Start Playing Free
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
        <Link
          href="/daily"
          className="flex items-center gap-2 px-8 py-4 glass rounded-2xl font-semibold text-lg hover:bg-accent transition-all"
        >
          <Zap className="w-5 h-5 text-primary" />
          Today's Challenge
        </Link>
      </motion.div>

      {/* Feature badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex flex-wrap justify-center gap-3"
      >
        {badges.map((b, i) => (
          <motion.div
            key={b.text}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1 }}
            className="flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-medium"
          >
            <span>{b.icon}</span>
            <span>{b.text}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="grid grid-cols-3 gap-8 mt-16 pt-12 border-t border-border/40"
      >
        {[
          { value: '12,400+', label: 'Puzzles Solved' },
          { value: '#1', label: 'Brain App in Almaty' },
          { value: '4', label: 'Unique Game Modes' },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-2xl md:text-3xl font-black text-primary">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}