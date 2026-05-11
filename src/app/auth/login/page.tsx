'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Loader2, KeyRound, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ThemeBackground } from '@/components/theme-backgrounds'
import Link from 'next/link'

type Step = 'email' | 'otp'

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // Step 1: send OTP
 const handleSendOtp = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      // ← НЕТ emailRedirectTo — это заставляет Supabase слать код, не ссылку
    },
  })

  if (error) {
    setError(error.message)
  } else {
    setStep('otp')
  }
  setLoading(false)
}

  // Step 2: verify OTP code
  const handleVerifyOtp = async () => {
    const code = otp.join('')
    if (code.length < 6) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })

    if (error) {
      setError('Invalid code. Please try again.')
      setOtp(['', '', '', '', '', ''])
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  // OTP input handler — auto-advance
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-advance
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`)
      next?.focus()
    }

    // Auto-submit when complete
    if (newOtp.every((d) => d !== '') && index === 5) {
      setTimeout(() => {
        const code = newOtp.join('')
        if (code.length === 6) handleVerifyOtpDirect(newOtp)
      }, 100)
    }
  }

  const handleVerifyOtpDirect = async (digits: string[]) => {
    const code = digits.join('')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (error) {
      setError('Invalid code. Please try again.')
      setOtp(['', '', '', '', '', ''])
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleOtpKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`)
      prev?.focus()
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      <ThemeBackground />
      <div className="relative z-10 w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass clay-lg rounded-3xl p-8"
        >
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary mx-auto flex items-center justify-center mb-3">
              <span className="text-primary-foreground font-black text-2xl">S</span>
            </div>
            <h1 className="text-2xl font-black">Sudomind</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 'email' ? 'Sign in to train your brain' : `Code sent to ${email}`}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Google */}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGoogle}
                  className="w-full flex items-center justify-center gap-3 glass rounded-2xl py-3 font-medium hover:bg-accent transition-colors border border-border"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </motion.button>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-2xl bg-input border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                  </div>
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3 font-bold hover:opacity-90 disabled:opacity-60 transition-opacity"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <KeyRound className="w-4 h-4" />
                    }
                    {loading ? 'Sending code...' : 'Send 6-digit code'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Step 2: OTP code */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">📬</div>
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code we sent to
                    <br />
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>
                </div>

                {/* 6 digit input boxes */}
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className={`
                        w-11 h-14 text-center text-xl font-black rounded-xl border-2 transition-all
                        bg-input focus:outline-none focus:ring-2 focus:ring-primary
                        ${digit ? 'border-primary bg-primary/5' : 'border-border'}
                        ${error ? 'border-destructive' : ''}
                      `}
                    />
                  ))}
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-destructive text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerifyOtp}
                  disabled={loading || otp.some((d) => !d)}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-3 font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {loading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <KeyRound className="w-4 h-4" />
                  }
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </motion.button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => { setStep('email'); setOtp(['','','','','','']); setError('') }}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change email
                  </button>
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="text-primary hover:underline disabled:opacity-50"
                  >
                    Resend code
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <Link href="/" className="hover:text-foreground transition-colors">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}