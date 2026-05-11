'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { GlobalNavbar } from '@/components/layout/global-navbar'
import { AvatarUpload } from '@/components/profile/avatar-upload'
import { Save, Loader2, MapPin, Mail, Calendar, Star, Trophy, Flame, Brain } from 'lucide-react'
import { toast } from 'sonner'

const KZ_CITIES = [
  'Almaty', 'Astana', 'Shymkent', 'Karaganda',
  'Aktobe', 'Taraz', 'Pavlodar', 'Oskemen',
  'Semey', 'Atyrau', 'Kostanay', 'Petropavl',
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
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

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        // ← Берём фото: из профиля или из Google metadata
        const photo = profileData.avatar_url
          || user.user_metadata?.avatar_url
          || null
        setAvatarUrl(photo)
        setForm({
          full_name: profileData.full_name ?? user.user_metadata?.full_name ?? '',
          username: profileData.username ?? '',
          bio: profileData.bio ?? '',
          city: profileData.city ?? 'Almaty',
        })
      } else {
        // Профиль ещё не создан — создаём
        const username = user.email?.split('@')[0] + '_' + Math.floor(Math.random() * 9000 + 1000)
        const newProfile = {
          id: user.id,
          full_name: user.user_metadata?.full_name ?? '',
          avatar_url: user.user_metadata?.avatar_url ?? null,
          username,
          city: 'Almaty',
        }
        await supabase.from('profiles').upsert(newProfile)
        setAvatarUrl(user.user_metadata?.avatar_url ?? null)
        setForm({
          full_name: user.user_metadata?.full_name ?? '',
          username,
          bio: '',
          city: 'Almaty',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    // ← UPSERT гарантирует что данные сохранятся
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: form.full_name,
        username: form.username,
        bio: form.bio,
        city: form.city,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    if (error) {
      toast.error(`Save failed: ${error.message}`)
    } else {
      toast.success('Profile saved! ✅')
    }
    setSaving(false)
  }

  const handleAvatarUpdate = async (url: string) => {
    setAvatarUrl(url)
    if (!user) return
    // ← Сразу сохраняем в БД
    await supabase
      .from('profiles')
      .upsert({ id: user.id, avatar_url: url, updated_at: new Date().toISOString() }, { onConflict: 'id' })
  }

  const initials = form.full_name
    .split(' ')
    .map((n) => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  const joinDate = user
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : ''

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 md:pb-6">
      <ThemeBackground />
      <div className="relative z-10">
        <GlobalNavbar />

        <main className="max-w-4xl mx-auto px-4 md:px-6 py-6">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <h1 className="text-2xl font-black">Your Profile</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage your info and preferences</p>
          </motion.div>

          <div className="grid md:grid-cols-[260px_1fr] gap-5">
            {/* Left */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass clay-lg rounded-3xl p-6 text-center"
              >
                <AvatarUpload
                  currentUrl={avatarUrl}
                  initials={initials}
                  userId={user?.id}
                  onUpdate={handleAvatarUpdate}
                />
                <p className="font-bold mt-3">{form.full_name || 'Your Name'}</p>
                <p className="text-xs text-muted-foreground">@{form.username}</p>
                <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  {form.city}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass clay rounded-3xl p-4 space-y-3"
              >
                {[
                  { icon: <Brain className="w-4 h-4 text-primary" />, label: 'Solved', value: profile?.total_solved ?? 0 },
                  { icon: <Star className="w-4 h-4 text-yellow-500" />, label: 'Points', value: (profile?.total_points ?? 0).toLocaleString() },
                  { icon: <Flame className="w-4 h-4 text-orange-500" />, label: 'Streak', value: `${profile?.streak ?? 0}d` },
                  { icon: <Trophy className="w-4 h-4 text-red-500" />, label: 'Rank', value: `#${profile?.city_rank ?? '?'}` },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {s.icon}{s.label}
                    </div>
                    <span className="text-sm font-bold">{s.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {joinDate}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right: form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass clay-lg rounded-3xl p-6 space-y-4"
            >
              <h2 className="font-bold text-lg">Edit Profile</h2>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Dilara Ruslanova"
                  className="w-full px-4 py-2.5 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                    placeholder="dilara_r"
                    className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  City (affects leaderboard)
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {KZ_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="I solve Sudoku every morning ☕"
                  rows={3}
                  maxLength={160}
                  className="w-full px-4 py-2.5 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{form.bio.length}/160</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3 font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}