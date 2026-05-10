'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { UserMenu } from '@/components/layout/user-menu'
import { createClient } from '@/lib/supabase/client'
import {
  Brain, Zap, Waves, Code2, Sunrise, GraduationCap,
  Trophy, CalendarDays, ArrowRight, Flame, Star, MapPin, Target,
} from 'lucide-react'

const GAME_MODES = [
  { icon: <Brain className="w-5 h-5" />, title: 'Classic', desc: '3 lives, standard rules', href: '/game?mode=classic', color: 'text-primary bg-primary/10', badge: null },
  { icon: <CalendarDays className="w-5 h-5" />, title: 'Daily Challenge', desc: 'One puzzle for everyone', href: '/daily', color: 'text-green-600 bg-green-500/10', badge: '🔥 Live' },
  { icon: <Sunrise className="w-5 h-5" />, title: 'Brain Warm-up', desc: '3-min before exams', href: '/game?mode=warmup', color: 'text-orange-500 bg-orange-500/10', badge: 'Quick' },
  { icon: <Code2 className="w-5 h-5" />, title: 'Developer Mode', desc: 'O(n²) difficulty', href: '/game?mode=dev', color: 'text-red-600 bg-red-500/10', badge: 'nFactorial' },
  { icon: <Waves className="w-5 h-5" />, title: 'Zen Mode', desc: 'No pressure', href: '/game?mode=zen', color: 'text-blue-500 bg-blue-500/10', badge: 'Relax' },
  { icon: <GraduationCap className="w-5 h-5" />, title: 'Academy', desc: 'AI-guided tutorial', href: '/game?mode=academy', color: 'text-purple-500 bg-purple-500/10', badge: 'Learn' },
]

interface DashboardClientProps {
  profile: any
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function DashboardClient({ profile }: DashboardClientProps) {
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadActivity = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Last 7 days activity
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

      // Merge with all 7 days (fill zeros)
      const merged = days.map((date, i) => {
        const found = data?.find((d) => d.date === date)
        return {
          day: DAYS[new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1],
          date,
          solved: found?.puzzles_solved ?? 0,
          score: found?.total_score ?? 0,
        }
      })

      setActivity(merged)
      setLoading(false)
    }
    loadActivity()
  }, [])

  const totalThisWeek = activity.reduce((s, d) => s + d.solved, 0)
  const bestDay = activity.reduce((best, d) => d.solved > best.solved ? d : best, { solved: 0, day: '-' })

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 md:pb-0">
      <ThemeBackground />
      <div className="relative z-10">
        {/* Nav */}
        <nav className="glass border-b border-border/40 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-black text-lg">S</span>
              </div>
              <span className="font-bold text-lg hidden sm:block">
                Sudo<span className="text-primary">mind</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/leaderboard" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Link>
              <Link href="/daily" className="hover:text-foreground transition-colors flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                Daily
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <UserMenu />
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* Welcome */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h1 className="text-2xl font-black">
              Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Player'} 👋
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Here's your brain training summary</p>
          </motion.div>

          {/* Top stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              {
                icon: <Flame className="w-5 h-5 text-orange-500" />,
                label: 'Streak',
                value: `${profile?.streak ?? 0}d`,
                sub: 'days in a row',
                color: 'text-orange-500',
              },
              {
                icon: <Brain className="w-5 h-5 text-primary" />,
                label: 'Solved',
                value: profile?.total_solved ?? 0,
                sub: 'total puzzles',
                color: 'text-primary',
              },
              {
                icon: <Star className="w-5 h-5 text-yellow-500" />,
                label: 'Points',
                value: profile?.total_points >= 1000
                  ? `${(profile.total_points / 1000).toFixed(1)}k`
                  : profile?.total_points ?? 0,
                sub: 'total XP',
                color: 'text-yellow-500',
              },
              {
                icon: <MapPin className="w-5 h-5 text-red-500" />,
                label: 'City Rank',
                value: `#${profile?.city_rank ?? '?'}`,
                sub: profile?.city ?? 'Almaty',
                color: 'text-red-500',
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass clay rounded-2xl p-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  {stat.icon}
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Activity chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass clay-lg rounded-3xl p-6 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold">Weekly Activity</h2>
                <p className="text-xs text-muted-foreground">Puzzles solved last 7 days</p>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <div className="text-center">
                  <p className="font-black text-primary text-base">{totalThisWeek}</p>
                  <p>This week</p>
                </div>
                <div className="text-center">
                  <p className="font-black text-green-500 text-base">{bestDay.solved}</p>
                  <p>Best day ({bestDay.day})</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">
                Loading activity...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={activity} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--popover)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                    formatter={(value: any) => [`${value} puzzles`, 'Solved']}
                  />
                  <Area
                    type="monotone"
                    dataKey="solved"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#activityGrad)"
                    dot={{ fill: 'var(--primary)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          {/* Game modes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Choose Your Mode</h2>
              <Link href="/game" className="text-xs text-primary hover:underline">
                Quick Play →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {GAME_MODES.map((mode, i) => (
                <motion.div
                  key={mode.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  whileHover={{ y: -3 }}
                >
                  <Link
                    href={mode.href}
                    className="glass clay rounded-2xl p-4 block hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2 rounded-xl ${mode.color}`}>
                        {mode.icon}
                      </div>
                      {mode.badge && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {mode.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm mb-0.5">{mode.title}</h3>
                    <p className="text-xs text-muted-foreground">{mode.desc}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-primary font-semibold group-hover:gap-2 transition-all">
                      Play <ArrowRight className="w-3 h-3" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/40">
          <div className="flex items-center justify-around px-6 py-2">
            <Link href="/dashboard" className="flex flex-col items-center gap-0.5 p-2 text-primary">
              <Brain className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Home</span>
            </Link>
            <Link href="/daily" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary">
              <CalendarDays className="w-5 h-5" />
              <span className="text-[10px]">Daily</span>
            </Link>
            <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary">
              <Trophy className="w-5 h-5" />
              <span className="text-[10px]">Ranks</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary">
              <span className="text-lg">👤</span>
              <span className="text-[10px]">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}