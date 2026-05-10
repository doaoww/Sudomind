'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Brain } from 'lucide-react'

export function FinalCta() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass clay-lg rounded-3xl p-12 text-center"
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            className="text-6xl mb-6"
          >
            🧠
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-black mb-4">
            Ready to Train
            <br />
            <span className="text-primary">Your Brain?</span>
          </h2>

          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Join the smartest community in Almaty. Your Daily Challenge is waiting.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/daily"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:opacity-90 transition-all hover:scale-105"
            >
              Start Today's Challenge
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-8 py-4 glass rounded-2xl font-semibold text-lg hover:bg-accent transition-all"
            >
              <Brain className="w-5 h-5 text-primary" />
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}