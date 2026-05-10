'use client'

import { motion } from 'framer-motion'
import { Check, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect to get started',
    cta: 'Play Free',
    href: '/auth/login',
    primary: false,
    features: [
      'Unlimited puzzles (Easy & Medium)',
      '3 AI hints per day',
      'Basic leaderboard access',
      'All 4 visual themes',
      'Daily Challenge',
    ],
  },
  {
    name: 'Pro',
    price: '$4.99',
    period: 'per month',
    desc: 'For serious brain athletes',
    cta: 'Upgrade to Pro',
    href: '/auth/login?plan=pro',
    primary: true,
    badge: '🔥 Most Popular',
    features: [
      'Everything in Free',
      'Unlimited AI coaching',
      'Hard & Expert difficulty',
      'All game modes unlocked',
      'Exclusive Pro themes & skins',
      'Priority leaderboard badge',
      'Detailed analytics dashboard',
      'Early access to new features',
    ],
  },
]

export function Pricing() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Simple{' '}
            <span className="text-primary">Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Start free. Upgrade when your brain demands more.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -6 }}
              className={`
                relative rounded-3xl p-8
                ${plan.primary
                  ? 'bg-primary text-primary-foreground shadow-2xl shadow-primary/30'
                  : 'glass clay'
                }
              `}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {plan.primary ? <Sparkles className="w-5 h-5" /> : <Zap className="w-5 h-5 opacity-60" />}
                  <span className="font-bold text-lg">{plan.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className={`text-sm ${plan.primary ? 'opacity-70' : 'text-muted-foreground'}`}>
                    /{plan.period}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${plan.primary ? 'opacity-70' : 'text-muted-foreground'}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${plan.primary ? '' : 'text-primary'}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`
                  block w-full text-center py-3 rounded-2xl font-bold transition-all hover:scale-105
                  ${plan.primary
                    ? 'bg-primary-foreground text-primary hover:opacity-90'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                  }
                `}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}