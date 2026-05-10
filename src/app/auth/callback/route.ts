import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingProfile) {
        const username = user.email?.split('@')[0] ?? `user_${Date.now()}`
        await supabase.from('profiles').insert({
          id: user.id,
          username,
          full_name: user.user_metadata?.full_name ?? username,
          avatar_url: user.user_metadata?.avatar_url ?? null,
          city: 'Almaty',
        })
      }

      // ← Redirect to dashboard, not game
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}