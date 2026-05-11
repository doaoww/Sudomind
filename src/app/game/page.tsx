import { createClient } from '@/lib/supabase/server'
import { GameClient } from './game-client'

interface Props {
  searchParams: { mode?: string; difficulty?: string }
}

export default async function GamePage({ searchParams }: Props) {
  const { mode, difficulty } = await searchParams 
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <GameClient
      profile={profile}
      userId={user?.id}
      gameMode={mode}
    />
  )
}