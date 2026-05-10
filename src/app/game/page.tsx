import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GameClient } from './game-client'

export default async function GamePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('id, full_name, username, avatar_url, total_points, streak, city_rank, level')
    .eq('city', 'Almaty')
    .order('city_rank', { ascending: true })
    .limit(10)

  return <GameClient profile={profile} leaderboard={leaderboard ?? []} userId={user.id} />
}