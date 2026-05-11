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
      // Upsert profile — гарантирует создание
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name
          ?? user.user_metadata?.name
          ?? user.email?.split('@')[0]
          ?? 'Player',
        avatar_url: user.user_metadata?.avatar_url ?? null,
        username: (user.email?.split('@')[0] ?? 'user') + '_' + Math.floor(Math.random() * 9000 + 1000),
        city: 'Almaty',
      }, { onConflict: 'id', ignoreDuplicates: true })

      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}