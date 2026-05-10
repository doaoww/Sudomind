'use client'

import { motion } from 'framer-motion'
import { Brain, Heart, Trophy, Code2, Sunrise, Waves, GraduationCap, Zap } from 'lucide-react'

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'Sana AI Coach',
    desc: 'Gemini-powered hints that teach real Sudoku strategies. Learn Hidden Singles, Naked Pairs, and more.',
    color: 'text-primary',
    bg: 'bg-primary/8',
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: '3 Lives System',
    desc: 'Every mistake costs a life. Real stakes, real satisfaction when you win.',
    color: 'text-red-500',
    bg: 'bg-red-500/8',
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: 'Almaty Leaderboard',
    desc: 'Compete with players in your city, Kazakhstan, and globally.',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/8',
  },
  {
    icon: <Sunrise className="w-6 h-6" />,
    title: 'Brain Warm-up',
    desc: '3-minute sessions to fire up your neurons before exams.',
    color: 'text-orange-500',
    bg: 'bg-orange-500/8',
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'Developer Mode',
    desc: 'O(n²) difficulty. Bugs instead of errors. Deploy to win.',
    color: 'text-red-600',
    bg: 'bg-red-600/8',
  },
  {
    icon: <Waves className="w-6 h-6" />,
    title: 'Zen Mode',
    desc: 'No timer. No lives. Just you, soft music, and beautiful themes.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/8',
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Sana Academy',
    desc: 'AI-guided tutorials for beginners. Learn by doing.',
    color: 'text-purple-500',
    bg: 'bg-purple-500/8',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Daily Challenge',
    desc: 'One puzzle for everyone. 24 hours. Who solves it fastest?',
    color: 'text-green-500',
    bg: 'bg-green-500/8',
  },
]

export function FeaturesBento() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Not Just Sudoku.{' '}
            <span className="text-primary">A Platform.</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Every feature designed to keep you coming back — and getting smarter.
          </p>
        </motion.div>

        {/* Equal 4-column grid — no weird sizing */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
              className={`glass clay rounded-2xl p-5 ${f.bg} border border-border/20`}
            >
              <div className={`mb-3 ${f.color}`}>{f.icon}</div>
              <h3 className="font-bold text-sm mb-1.5">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}