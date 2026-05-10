'use client'

import { useTheme } from '@/components/theme-provider'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

function Cloud({ index, y, size = 'md' }: { index: number; y: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-20 h-10 opacity-40',
    md: 'w-32 h-16 opacity-50',
    lg: 'w-44 h-20 opacity-60',
  }
  const speeds = [35, 45, 55, 40, 50, 60, 38, 48]
  return (
    <div
      className={`absolute pointer-events-none ${sizes[size]}`}
      style={{
        top: `${y}%`,
        left: `${(index * 13) % 100}%`,
        animation: `cloud-drift ${speeds[index % speeds.length]}s linear infinite`,
        animationDelay: `${-index * 5}s`,
      }}
    >
      <svg viewBox="0 0 100 50" className="w-full h-full fill-white drop-shadow-xl">
        <ellipse cx="25" cy="35" rx="20" ry="15" />
        <ellipse cx="50" cy="30" rx="25" ry="18" />
        <ellipse cx="75" cy="35" rx="20" ry="15" />
        <ellipse cx="40" cy="20" rx="18" ry="14" />
        <ellipse cx="60" cy="20" rx="18" ry="14" />
      </svg>
    </div>
  )
}

function CloudsBackground() {
  const clouds = [
    { size: 'lg' as const, y: 5 },
    { size: 'md' as const, y: 15 },
    { size: 'sm' as const, y: 25 },
    { size: 'lg' as const, y: 35 },
    { size: 'md' as const, y: 45 },
    { size: 'sm' as const, y: 55 },
    { size: 'lg' as const, y: 10 },
    { size: 'md' as const, y: 40 },
  ]
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200/60 via-blue-100/40 to-transparent" />
      {clouds.map((c, i) => (
        <Cloud key={i} index={i} y={c.y} size={c.size} />
      ))}
    </div>
  )
}

function KawaiiBackground() {
  const flowers = [
    { x: 5, y: 10, size: 35, color: '#FFB6C1', delay: 0 },
    { x: 15, y: 60, size: 28, color: '#DDA0DD', delay: 0.5 },
    { x: 25, y: 30, size: 40, color: '#98D8C8', delay: 1 },
    { x: 70, y: 50, size: 30, color: '#FFB6C1', delay: 2.5 },
    { x: 80, y: 20, size: 36, color: '#DDA0DD', delay: 3 },
    { x: 90, y: 65, size: 34, color: '#98D8C8', delay: 3.5 },
    { x: 60, y: 80, size: 42, color: '#FFB6C1', delay: 4 },
  ]
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-200/50 via-purple-100/30 to-pink-200/40" />
      {flowers.map((f, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${f.y}%`,
            left: `${f.x}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            animation: `kawaii-float 4s ease-in-out infinite`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <svg viewBox="0 0 50 50" className="w-full h-full drop-shadow-lg">
            {[0, 72, 144, 216, 288].map((r, j) => (
              <ellipse
                key={j}
                cx="25" cy="15" rx="8" ry="12"
                fill={f.color}
                transform={`rotate(${r} 25 25)`}
                opacity={0.9}
              />
            ))}
            <circle cx="25" cy="25" r="8" fill="#FFD700" />
            <circle cx="23" cy="23" r="2" fill="white" opacity={0.6} />
          </svg>
        </div>
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={`s-${i}`}
          className="absolute"
          style={{
            top: `${(i * 23 + 5) % 100}%`,
            left: `${(i * 17 + 8) % 100}%`,
            width: '12px',
            height: '12px',
            animation: `sparkle-twinkle 2s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        >
          <svg viewBox="0 0 20 20" className="w-full h-full">
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" fill="white" opacity={0.8} />
          </svg>
        </div>
      ))}
    </div>
  )
}

// ← nFactorial: instant animations, no delay
const SYMBOLS = ['{ }', '</>', 'fn()', '( )', '=>', '&&', 'n!', 'const', 'async', '===', 'O(n²)', 'deploy', 'git push', 'npm i', '// TODO']

function NFactorialBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Dot grid — instant */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.05,
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.5) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Code particles — start immediately, stagger only position not delay */}
      {Array.from({ length: 18 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute font-mono font-bold select-none"
          style={{
            color: `rgba(220, 38, 38, ${0.15 + (i % 3) * 0.07})`,
            fontSize: `${14 + (i % 4) * 4}px`,
            left: `${(i * 13 + 3) % 94}%`,
          }}
          // ← No delay — start immediately at different y positions
          initial={{ y: `${30 + (i * 37) % 70}vh`, opacity: 0.7 }}
          animate={{
            y: [
              `${30 + (i * 37) % 70}vh`,
              `${(30 + (i * 37) % 70) - 60}vh`,
            ],
            opacity: [0.7, 0.9, 0.5, 0],
          }}
          transition={{
            duration: 7 + (i % 4) * 2,
            repeat: Infinity,
            // ← repeatDelay staggers restarts, not initial appearance
            repeatDelay: (i % 5) * 0.8,
            ease: 'linear',
          }}
        >
          {SYMBOLS[i % SYMBOLS.length]}
        </motion.div>
      ))}

      {/* Vertical scan lines — instant */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ opacity: 0.04 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <line
            key={i}
            x1={`${i * 11}%`} y1="0"
            x2={`${i * 11 + 4}%`} y2="100%"
            stroke="rgb(220,38,38)"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Moving horizontal scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-red-500/20"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      />

      {/* Glow orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-400/6 rounded-full blur-3xl" />
    </div>
  )
}

function DarkBackground() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: (i * 17 + 7) % 100,
    y: (i * 23 + 11) % 100,
    size: 1 + (i % 3),
    delay: (i % 10) * 0.3,
  }))
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950/50" />
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.y}%`,
            left: `${s.x}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            boxShadow: `0 0 ${s.size * 3}px ${s.size}px rgba(255,255,255,0.4)`,
            animation: `star-twinkle 3s ease-in-out infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: '1s' }}
      />
    </div>
  )
}

export function ThemeBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  switch (theme) {
    case 'clouds': return <CloudsBackground />
    case 'kawaii': return <KawaiiBackground />
    case 'nfactorial': return <NFactorialBackground />
    case 'dark': return <DarkBackground />
    default: return <CloudsBackground />
  }
}