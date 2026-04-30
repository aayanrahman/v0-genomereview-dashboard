'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dna, ArrowRight, Mail, Inbox } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'sent'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Auto-redirect when the magic link is clicked in the same browser session
  useEffect(() => {
    if (step !== 'sent') return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        window.location.href = '/'
      }
    })
    return () => subscription.unsubscribe()
  }, [step])

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (error) {
      setError(error.message)
    } else {
      setStep('sent')
    }
    setLoading(false)
  }

  async function handleResend() {
    setError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen bg-[#0F1B2D] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1E2A3D]">
            <Dna className="h-5 w-5 text-[#D85A30]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight">GenomeReview</h1>
            <p className="text-[10px] text-white/40">AlphaGenome-powered</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-white/10 bg-[#1E2A3D] p-8">
          {step === 'email' ? (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Get started</h2>
                <p className="mt-1 text-sm text-white/50">
                  Enter your email — we'll send a sign-in link. No password needed.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/60 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoFocus
                      className="w-full rounded-lg bg-[#0F1B2D] border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#D85A30]/50 focus:border-[#D85A30]/50 transition-colors"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-[#D85A30]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#D85A30] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#D85A30]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Sending...' : 'Send sign-in link'}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0F1B2D] mb-4">
                  <Inbox className="h-6 w-6 text-[#D85A30]" />
                </div>
                <h2 className="text-lg font-semibold text-white">Check your inbox</h2>
                <p className="mt-2 text-sm text-white/50">
                  We sent a sign-in link to{' '}
                  <span className="text-white/80">{email}</span>.
                  Click it to continue — this page will update automatically.
                </p>
              </div>

              {error && (
                <p className="mb-4 text-sm text-[#D85A30] text-center">{error}</p>
              )}

              <div className="flex items-center justify-between text-xs text-white/30">
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(null) }}
                  className="hover:text-white/60 transition-colors"
                >
                  Use a different email
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  className="hover:text-white/60 transition-colors"
                >
                  Resend link
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          Your cases are private and only visible to you.
        </p>
      </div>
    </div>
  )
}
