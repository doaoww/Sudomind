'use client'

import { motion } from 'framer-motion'
import { MapPin, Flame, Trophy } from 'lucide-react'
import Link from 'next/link'

const fakeTop3 = [
  { name: 'Зарина К.', points: 67800, streak: 22, rank: 1, avatar: '👩‍💻' },
  { name: 'Дилара Р.', points: 45200, streak: 14, rank: 2, avatar: '🧕' },
  { name: 'Айбек С.', points: 32100, streak: 7, rank: 3, avatar: '👨‍🎓' },
]

const medals = ['🥇', '🥈', '🥉']

export function LeaderboardPreview() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 text-sm font-medium text-primary mb-4">
            <MapPin className="w-4 h-4" />
            Live · Almaty, Kazakhstan
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Who's the Sharpest
            <br />
            <span className="text-primary">Mind in Almaty?</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Join hundreds of players competing for the top spot right now.
          </p>
        </motion.div>

        <div className="glass clay-lg rounded-3xl p-6 space-y-3">
          {fakeTop3.map((player, i) => (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl hover:bg-accent/50 transition-colors"
            >
              <span className="text-2xl">{medals[i]}</span>
              <span className="text-3xl">{player.avatar}</span>
              <div className="flex-1">
                <p className="font-bold">{player.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Flame className="w-3 h-3 text-orange-500" />
                  {player.streak} day streak
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-primary text-lg">{player.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">points</p>
              </div>
            </motion.div>
          ))}

          <div className="pt-3 border-t border-border/40 text-center">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Trophy className="w-4 h-4" />
              View Full Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}