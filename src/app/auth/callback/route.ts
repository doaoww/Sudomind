import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/auth/login?error=${error}`)
  }

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.exchangeCodeForSession(code)

    if (!authError && user) {
      // Check if profile already exists — don't overwrite username on re-login
      const { data: existing } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('id', user.id)
        .single()

      if (!existing) {
        // First time — create profile
        const baseUsername = (user.email?.split('@')[0] ?? 'user')
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_')
        const username = baseUsername + '_' + Math.floor(Math.random() * 9000 + 1000)

        await supabase.from('profiles').insert({
          id: user.id,
          full_name: user.user_metadata?.full_name
            ?? user.user_metadata?.name
            ?? user.email?.split('@')[0]
            ?? 'Player',
          avatar_url: user.user_metadata?.avatar_url
            ?? user.user_metadata?.picture   // Google sends 'picture' not 'avatar_url'
            ?? null,
          username,
          city: 'Almaty',
          level: 1,
          total_points: 0,
          total_solved: 0,
          streak: 0,
        })
      } else {
        // Returning user — only refresh avatar from Google if they have one
        const googleAvatar = user.user_metadata?.avatar_url
          ?? user.user_metadata?.picture
          ?? null
        if (googleAvatar) {
          await supabase
            .from('profiles')
            .update({ avatar_url: googleAvatar, updated_at: new Date().toISOString() })
            .eq('id', user.id)
        }
      }

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}