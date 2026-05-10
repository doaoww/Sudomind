'use client'

import { motion } from 'framer-motion'
import { useTheme, themes, type Theme } from '@/components/theme-provider'

const themePreview: Record<Theme, { emoji: string; desc: string; color: string }> = {
  clouds: { emoji: '☁️', desc: 'Soft glassmorphism', color: 'from-blue-200 to-blue-100' },
  kawaii: { emoji: '🌸', desc: 'Cute pastel pink', color: 'from-pink-200 to-purple-100' },
  nfactorial: { emoji: '⚡', desc: 'Developer mode', color: 'from-red-100 to-white' },
  dark: { emoji: '🌙', desc: 'Neon on dark', color: 'from-slate-800 to-indigo-900' },
}

export function ThemesShowcase() {
  const { theme, setTheme } = useTheme()

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
            Your Game,{' '}
            <span className="text-primary">Your Aesthetic</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Four hand-crafted themes. Click one and watch the entire interface transform.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {themes.map((t, i) => {
            const preview = themePreview[t.value]
            const isActive = theme === t.value
            return (
              <motion.button
                key={t.value}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.03, y: -4 }}
                onClick={() => setTheme(t.value)}
                className={`
                  relative rounded-3xl p-6 text-left transition-all duration-300 border-2
                  bg-gradient-to-br ${preview.color}
                  ${isActive ? 'border-primary shadow-lg shadow-primary/20' : 'border-transparent glass'}
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-theme"
                    className="absolute inset-0 rounded-3xl border-2 border-primary"
                  />
                )}
                <div className="text-4xl mb-3">{preview.emoji}</div>
                <p className="font-bold text-sm mb-1">{t.label}</p>
                <p className="text-xs opacity-70">{preview.desc}</p>
                {isActive && (
                  <span className="absolute top-3 right-3 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}