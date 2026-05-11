import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, username, avatar_url, level, total_points, total_solved, streak, city, city_rank')
    .eq('id', user.id)
    .single()

  return <DashboardClient profile={profile ?? {}} />
}