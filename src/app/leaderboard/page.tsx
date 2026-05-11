'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { MapPin, Globe, Flag, Flame, Trophy, Home, CalendarDays, Brain } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { GlobalNavbar } from '@/components/layout/global-navbar'
import Link from 'next/link'

type Tab = 'almaty' | 'kazakhstan' | 'global'
const medals = ['🥇', '🥈', '🥉']

// Fallback fake data when DB is empty
const FAKE_DATA = [
  { id: '1', full_name: 'Зарина Каримова', username: 'zarina_k', avatar_url: null, total_points: 67800, streak: 22, level: 15, city: 'Almaty' },
  { id: '2', full_name: 'Дилара Руслановна', username: 'dilara_r', avatar_url: null, total_points: 45200, streak: 14, level: 12, city: 'Almaty' },
  { id: '3', full_name: 'Айбек Сейткали', username: 'aibek_s', avatar_url: null, total_points: 32100, streak: 7, level: 9, city: 'Almaty' },
  { id: '4', full_name: 'Нурлан Бекенов', username: 'nurlan_b', avatar_url: null, total_points: 18900, streak: 3, level: 7, city: 'Almaty' },
  { id: '5', full_name: 'Мадина Ахметова', username: 'madina_a', avatar_url: null, total_points: 41500, streak: 11, level: 11, city: 'Almaty' },
]

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>('almaty')
  const [entries, setEntries] = useState<any[]>(FAKE_DATA)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        let query = supabase
          .from('leaderboard')
          .select('id, full_name, username, avatar_url, total_points, streak, level, city')
          .order('total_points', { ascending: false })
          .limit(20)

        if (tab === 'almaty') query = query.eq('city', 'Almaty')
        if (tab === 'kazakhstan') query = query.in('city', ['Almaty', 'Astana', 'Shymkent'])

        const { data } = await query
        if (data && data.length > 0) {
          setEntries(data)
        } else {
          setEntries(FAKE_DATA)
        }
      } catch {
        setEntries(FAKE_DATA)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [tab])

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'almaty', label: 'Almaty', icon: <MapPin className="w-4 h-4" /> },
    { key: 'kazakhstan', label: 'Kazakhstan', icon: <Flag className="w-4 h-4" /> },
    { key: 'global', label: 'Global', icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen relative overflow-hidden pb-16 md:pb-0">
      <ThemeBackground />
      <div className="relative z-10">

        {/* Full nav — same as landing */}
        <GlobalNavbar />
        
        <main className="max-w-4xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-black mb-2">
              Top <span className="text-primary">Brain Athletes</span>
            </h1>
            <p className="text-muted-foreground">
              Who's sharpest in Almaty right now?
            </p>
          </motion.div>

          {/* Top 3 podium */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {entries.slice(0, 3).map((entry, i) => {
              const initials = entry.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? '??'
              const heights = ['order-2 h-32', 'order-1 h-40', 'order-3 h-28']
              const podiumColors = ['bg-yellow-500/10 border-yellow-500/30', 'bg-primary/10 border-primary/30', 'bg-orange-500/10 border-orange-500/30']
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`flex flex-col items-center justify-end rounded-2xl border p-4 ${podiumColors[i]} ${i === 0 ? 'order-2' : i === 1 ? 'order-1' : 'order-3'}`}
                >
                  <span className="text-3xl mb-2">{medals[i]}</span>
                  <Avatar className="w-12 h-12 border-2 border-border mb-2">
                    <AvatarImage src={entry.avatar_url ?? ''} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-bold text-xs text-center truncate w-full">{entry.full_name}</p>
                  <p className="text-primary font-black text-sm">{entry.total_points?.toLocaleString()}</p>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground mt-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {entry.streak}d
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-4 glass rounded-2xl p-1.5 w-fit mx-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab === t.key
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Full list */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass clay-lg rounded-3xl p-4 space-y-1"
          >
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Loading...</div>
            ) : (
              entries.map((entry, i) => {
                const initials = entry.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) ?? '??'
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-accent/50 transition-colors"
                  >
                    <span className="w-8 text-center">
                      {i < 3
                        ? <span className="text-xl">{medals[i]}</span>
                        : <span className="text-sm font-bold text-muted-foreground">#{i + 1}</span>
                      }
                    </span>
                    <Avatar className="w-9 h-9 border border-border">
                      <AvatarImage src={entry.avatar_url ?? ''} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{entry.full_name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {entry.city} · Lv.{entry.level}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-primary text-sm">{entry.total_points?.toLocaleString()}</p>
                      <div className="flex items-center gap-0.5 justify-end text-xs text-muted-foreground">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {entry.streak}d
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </main>

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/40">
          <div className="flex items-center justify-around px-6 py-2">
            <Link href="/dashboard" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors">
              <Home className="w-5 h-5" />
              <span className="text-[10px]">Home</span>
            </Link>
            <Link href="/daily" className="flex flex-col items-center gap-0.5 p-2 text-muted-foreground hover:text-primary transition-colors">
              <CalendarDays className="w-5 h-5" />
              <span className="text-[10px]">Daily</span>
            </Link>
            <Link href="/game" className="flex flex-col items-center gap-0.5 p-2 text-primary">
              <Brain className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Play</span>
            </Link>
            <Link href="/leaderboard" className="flex flex-col items-center gap-0.5 p-2 text-primary">
              <Trophy className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Ranks</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}