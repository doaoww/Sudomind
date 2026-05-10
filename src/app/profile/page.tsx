'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { UserMenu } from '@/components/layout/user-menu'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save, Loader2, MapPin, Mail, Calendar, Star, Trophy, Flame, Brain } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const KZ_CITIES = [
  'Almaty', 'Astana', 'Shymkent', 'Karaganda',
  'Aktobe', 'Taraz', 'Pavlodar', 'Oskemen',
  'Semey', 'Atyrau', 'Kostanay', 'Kyzylorda',
  'Oral', 'Petropavl', 'Temirtau', 'Taldykorgan',
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    bio: '',
    city: 'Almaty',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setUser(user)

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setForm({
          full_name: data.full_name ?? '',
          username: data.username ?? '',
          bio: data.bio ?? '',
          city: data.city ?? 'Almaty',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        username: form.username,
        bio: form.bio,
        city: form.city,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to save. Try again.')
    } else {
      toast.success('Profile saved! ✅')
      setProfile({ ...profile, ...form })
    }
    setSaving(false)
  }

  const initials = form.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2) || '?'

  const joinDate = user
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long', year: 'numeric'
      })
    : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

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
            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <UserMenu />
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-black">Your Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your info and preferences</p>
          </motion.div>

          <div className="grid md:grid-cols-[280px_1fr] gap-6">
            {/* Left: avatar + stats */}
            <div className="space-y-4">
              {/* Avatar card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass clay-lg rounded-3xl p-6 text-center"
              >
                <div className="relative inline-block mb-4">
                  <Avatar className="w-20 h-20 border-4 border-primary/30 mx-auto">
                    <AvatarImage src={profile?.avatar_url ?? ''} />
                    <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">{profile?.level ?? 1}</span>
                  </div>
                </div>
                <p className="font-bold text-base">{form.full_name || 'Your Name'}</p>
                <p className="text-xs text-muted-foreground">@{form.username || 'username'}</p>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {form.city}
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass clay rounded-3xl p-5 space-y-3"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stats</p>
                {[
                  { icon: <Brain className="w-4 h-4 text-primary" />, label: 'Solved', value: profile?.total_solved ?? 0 },
                  { icon: <Star className="w-4 h-4 text-yellow-500" />, label: 'Points', value: profile?.total_points?.toLocaleString() ?? 0 },
                  { icon: <Flame className="w-4 h-4 text-orange-500" />, label: 'Streak', value: `${profile?.streak ?? 0} days` },
                  { icon: <Trophy className="w-4 h-4 text-red-500" />, label: 'City Rank', value: `#${profile?.city_rank ?? '?'}` },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {s.icon}
                      {s.label}
                    </div>
                    <span className="text-sm font-bold">{s.value}</span>
                  </div>
                ))}
              </motion.div>

              {/* Account info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass clay rounded-3xl p-5 space-y-3"
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {joinDate}
                </div>
              </motion.div>
            </div>

            {/* Right: edit form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass clay-lg rounded-3xl p-6 space-y-5"
            >
              <h2 className="font-bold text-lg">Edit Profile</h2>

              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Dilara Ruslanova"
                  className="w-full px-4 py-3 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                />
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="dilara_r"
                    className="w-full pl-8 pr-4 py-3 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  City
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                >
                  {KZ_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  This determines your city leaderboard ranking
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="I solve Sudoku every morning before coffee ☕"
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-3 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {form.bio.length}/160
                </p>
              </div>

              {/* Save button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3.5 font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />
                }
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}