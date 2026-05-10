'use client'

import { motion } from 'framer-motion'
import { Flame, Trophy, Brain, Target, MapPin, Star } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Profile {
  full_name: string
  username: string
  avatar_url: string | null
  level: number
  total_points: number
  total_solved: number
  streak: number
  city_rank: number
  city: string
}

interface UserDashboardProps {
  profile: Profile
}

export function UserDashboard({ profile }: UserDashboardProps) {
  const initials = profile.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)

  const levelLabel =
    profile.level >= 15 ? 'Grandmaster' :
    profile.level >= 10 ? 'Expert' :
    profile.level >= 5  ? 'Intermediate' : 'Beginner'

  const cardVariants = {
    hidden: { opacity: 0, y: 12, scale: 0.95 as number },
    show: {
      opacity: 1,
      y: 0,
      scale: 1 as number,
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {/* Profile header */}
      <motion.div variants={cardVariants} className="glass clay-lg rounded-3xl p-5">
        <div className="flex items-center gap-4">
          <Avatar className="w-14 h-14 border-2 border-primary">
            <AvatarImage src={profile.avatar_url ?? ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-bold text-base">{profile.full_name}</p>
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              <Star className="w-3 h-3" />
              Level {profile.level} · {levelLabel}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Bento grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak - full width */}
        <motion.div variants={cardVariants} className="glass clay rounded-2xl p-4 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-muted-foreground">Daily Streak</span>
          </div>
          <p className="text-3xl font-black text-orange-500">{profile.streak}</p>
          <p className="text-xs text-muted-foreground mt-0.5">days in a row 🔥</p>
        </motion.div>

        {/* Solved */}
        <motion.div variants={cardVariants} className="glass clay rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Solved</span>
          </div>
          <p className="text-2xl font-black text-primary">{profile.total_solved}</p>
          <p className="text-xs text-muted-foreground">puzzles</p>
        </motion.div>

        {/* Points */}
        <motion.div variants={cardVariants} className="glass clay rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Points</span>
          </div>
          <p className="text-2xl font-black text-green-500">
            {profile.total_points >= 1000
              ? `${(profile.total_points / 1000).toFixed(1)}k`
              : profile.total_points}
          </p>
          <p className="text-xs text-muted-foreground">total XP</p>
        </motion.div>

        {/* City rank - full width */}
        <motion.div variants={cardVariants} className="glass clay rounded-2xl p-4 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-red-500" />
            <span className="text-xs text-muted-foreground">{profile.city} Rank</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-red-500">#{profile.city_rank}</span>
            <span className="text-sm text-muted-foreground">in {profile.city}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Trophy className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground">Keep playing to climb!</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}