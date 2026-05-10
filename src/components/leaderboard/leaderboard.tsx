'use client'

import { motion } from 'framer-motion'
import { Trophy, MapPin, Flame } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface LeaderboardEntry {
  id: string
  full_name: string
  username: string
  avatar_url: string | null
  total_points: number
  streak: number
  city_rank: number
  level: number
}

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

const medalColors = ['text-yellow-500', 'text-slate-400', 'text-orange-600']
const medalEmojis = ['🥇', '🥈', '🥉']

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass clay-lg rounded-3xl p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <h3 className="font-bold">Almaty Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {entries.map((entry, i) => {
          const isCurrentUser = entry.id === currentUserId
          const initials = entry.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                isCurrentUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent/50'
              }`}
            >
              {/* Rank */}
              <span className={`text-xl w-6 text-center ${i < 3 ? '' : 'text-sm text-muted-foreground font-bold'}`}>
                {i < 3 ? medalEmojis[i] : `#${i + 1}`}
              </span>

              {/* Avatar */}
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src={entry.avatar_url ?? ''} />
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-primary' : ''}`}>
                  {entry.full_name}
                  {isCurrentUser && <span className="ml-1 text-xs">(you)</span>}
                </p>
                <p className="text-xs text-muted-foreground">Lv.{entry.level}</p>
              </div>

              {/* Stats */}
              <div className="text-right">
                <p className="text-sm font-bold">{entry.total_points.toLocaleString()}</p>
                <div className="flex items-center gap-0.5 justify-end">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <p className="text-xs text-muted-foreground">{entry.streak}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}