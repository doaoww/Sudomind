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
const SYMBOLS = [
  'n!', 'n!', 'n!', // больше n! для узнаваемости
  '{ }', '</>', 'fn()', '=>', 'O(n²)',
  'const', 'async', '===', 'deploy',
  'npm i', '// OK', 'git push',
]

function NFactorialBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.06,
          backgroundImage: `radial-gradient(circle, rgba(200,0,0,0.5) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Floating symbols — яркий красный, медленно */}
      {Array.from({ length: 16 }, (_, i) => {
        // Разные стартовые y чтобы не ждать
        const startY = (i * 31 + 10) % 90
        const symbol = SYMBOLS[i % SYMBOLS.length]
        const isNFactorial = symbol === 'n!'

        return (
          <motion.div
            key={i}
            className="absolute font-mono font-black select-none"
            style={{
              // ← Яркий красный #FF0000 для n!, чуть тусклее для кода
              color: isNFactorial
                ? `rgba(255, 0, 0, ${0.45 + (i % 3) * 0.12})`
                : `rgba(220, 38, 38, ${0.18 + (i % 3) * 0.08})`,
              fontSize: isNFactorial
                ? `${20 + (i % 3) * 6}px`
                : `${13 + (i % 3) * 4}px`,
              left: `${(i * 14 + 5) % 92}%`,
              fontFamily: isNFactorial ? 'serif' : 'monospace',
            }}
            initial={{
              y: `${startY}vh`,
              opacity: isNFactorial ? 0.6 : 0.4,
            }}
            animate={{
              y: [`${startY}vh`, `${startY - 110}vh`],
              opacity: isNFactorial
                ? [0.6, 0.9, 0.7, 0.4, 0]
                : [0.4, 0.6, 0.4, 0.2, 0],
            }}
            transition={{
              // ← 20-30 секунд — медленно
              duration: 20 + (i % 5) * 4,
              repeat: Infinity,
              repeatDelay: (i % 5) * 1.2,
              ease: 'linear',
            }}
          >
            {symbol}
          </motion.div>
        )
      })}

      {/* Static n! watermarks в углах */}
      {[
        { top: '8%', left: '3%', opacity: 0.08, size: '5rem' },
        { top: '20%', right: '2%', opacity: 0.06, size: '4rem' },
        { bottom: '15%', left: '4%', opacity: 0.07, size: '4.5rem' },
        { bottom: '5%', right: '3%', opacity: 0.09, size: '5.5rem' },
      ].map((style, i) => (
        <div
          key={`wm-${i}`}
          className="absolute font-black font-serif select-none"
          style={{
            ...style,
            fontSize: style.size,
            color: '#FF0000',
          }}
        >
          n!
        </div>
      ))}


      {/* Vertical lines decoration */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.035 }}>
        {Array.from({ length: 7 }, (_, i) => (
          <line
            key={i}
            x1={`${i * 16 + 4}%`} y1="0"
            x2={`${i * 16 + 2}%`} y2="100%"
            stroke="#FF0000"
            strokeWidth="1"
          />
        ))}
      </svg>

      {/* Red glow orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/8 rounded-full blur-3xl" />
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