'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { GlobalNavbar } from '@/components/layout/global-navbar'
import { createClient } from '@/lib/supabase/client'
import {
  Brain, Zap, Waves, Code2, Sunrise,
  GraduationCap, Trophy, CalendarDays, ArrowRight, Flame, Star, MapPin, Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MODES = [
  { icon: <Brain className="w-5 h-5" />, title: 'Classic', desc: '3 lives · Standard rules', href: '/game?mode=classic', color: 'text-primary bg-primary/10', badge: null },
  { icon: <CalendarDays className="w-5 h-5" />, title: 'Daily Challenge', desc: 'Same puzzle for everyone', href: '/daily', color: 'text-green-600 bg-green-500/10', badge: '🔥 Live' },
  { icon: <Sunrise className="w-5 h-5" />, title: 'Brain Warm-up', desc: '3 min · Easy · Wake your brain', href: '/game?mode=warmup', color: 'text-orange-500 bg-orange-500/10', badge: '⚡ Quick' },
  { icon: <Code2 className="w-5 h-5" />, title: 'Developer Mode', desc: 'O(n²) · Bugs · Deploy to win', href: '/game?mode=dev', color: 'text-red-600 bg-red-500/10', badge: 'nFactorial' },
  { icon: <Waves className="w-5 h-5" />, title: 'Zen Mode', desc: 'No timer · No lives · Chill', href: '/game?mode=zen', color: 'text-blue-500 bg-blue-500/10', badge: '🌊 Relax' },
  { icon: <GraduationCap className="w-5 h-5" />, title: 'Academy', desc: 'AI-guided · Perfect for beginners', href: '/game?mode=academy', color: 'text-purple-500 bg-purple-500/10', badge: '📚 Learn' },
]

interface Props { profile: any }

export function DashboardClient({ profile }: Props) {
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Имя пользователя — берём первое слово
  const firstName = profile?.full_name?.split(' ')[0] || profile?.username || 'Player'

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d.toISOString().split('T')[0]
      })

      const { data } = await supabase
        .from('user_activity')
        .select('date, puzzles_solved, total_score')
        .eq('user_id', user.id)
        .gte('date', days[0])
        .order('date', { ascending: true })

      const merged = days.map((date) => {
        const dayIndex = new Date(date).getDay()
        const dayName = DAYS[dayIndex === 0 ? 6 : dayIndex - 1]
        const found = data?.find((d) => d.date === date)
        return { day: dayName, solved: found?.puzzles_solved ?? 0, score: found?.total_score ?? 0 }
      })

      setActivity(merged)
      setLoading(false)
    }
    load()
  }, [])

  const weekTotal = activity.reduce((s, d) => s + d.solved, 0)
  const best = activity.reduce((b, d) => d.solved > b.solved ? d : b, { solved: 0, day: '-' })

  const stats = [
    { icon: <Flame className="w-5 h-5 text-orange-500" />, label: 'Streak', value: `${profile?.streak ?? 0}d`, sub: 'days in a row', color: 'text-orange-500' },
    { icon: <Brain className="w-5 h-5 text-primary" />, label: 'Solved', value: profile?.total_solved ?? 0, sub: 'total puzzles', color: 'text-primary' },
    { icon: <Star className="w-5 h-5 text-yellow-500" />, label: 'Points', value: profile?.total_points >= 1000 ? `${(profile.total_points / 1000).toFixed(1)}k` : (profile?.total_points ?? 0), sub: 'total XP', color: 'text-yellow-500' },
    { icon: <MapPin className="w-5 h-5 text-red-500" />, label: 'City Rank', value: `#${profile?.city_rank ?? '?'}`, sub: profile?.city ?? 'Almaty', color: 'text-red-500' },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 md:pb-6">
      <ThemeBackground />
      <div className="relative z-10">
        <GlobalNavbar />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">

          {/* Welcome — персонализированное */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-black">
              Hello, <span className="text-primary">{firstName}</span> 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {weekTotal > 0
                ? `You've solved ${weekTotal} puzzles this week. Keep going!`
                : "Let's start today's brain training!"}
            </p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass clay rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  {s.icon}
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className={cn('text-2xl font-black', s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass clay-lg rounded-3xl p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold">Weekly Activity</h2>
                <p className="text-xs text-muted-foreground">Puzzles solved last 7 days</p>
              </div>
              <div className="flex gap-4 text-xs text-right">
                <div>
                  <p className="font-black text-primary text-lg leading-none">{weekTotal}</p>
                  <p className="text-muted-foreground">this week</p>
                </div>
                <div>
                  <p className="font-black text-green-500 text-lg leading-none">{best.solved}</p>
                  <p className="text-muted-foreground">best ({best.day})</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-36 flex items-center justify-center text-sm text-muted-foreground">
                Loading activity...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={activity} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '12px' }}
                    formatter={(v: any) => [`${v} puzzles`, 'Solved']}
                  />
                  <Area type="monotone" dataKey="solved" stroke="var(--primary)" strokeWidth={2.5}
                    fill="url(#grad)" dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Modes */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Choose Your Mode</h2>
            <Link href="/game" className="text-xs text-primary hover:underline">Quick Play →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MODES.map((mode, i) => (
              <motion.div
                key={mode.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                whileHover={{ y: -3 }}
              >
                <Link href={mode.href} className="glass clay rounded-2xl p-4 block group hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn('p-2 rounded-xl', mode.color)}>{mode.icon}</div>
                    {mode.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {mode.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-0.5">{mode.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{mode.desc}</p>
                  <div className="flex items-center gap-1 text-xs text-primary font-semibold group-hover:gap-2 transition-all">
                    Play <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}