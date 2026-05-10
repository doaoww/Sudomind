import { Hero } from '@/components/landing/hero'
import { ThemesShowcase } from '@/components/landing/themes-showcase'
import { FeaturesBento } from '@/components/landing/features-bento'
import { LeaderboardPreview } from '@/components/landing/leaderboard-preview'
import { Pricing } from '@/components/landing/pricing'
import { FinalCta } from '@/components/landing/final-cta'
import { ThemeBackground } from '@/components/theme-backgrounds'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { LandingNav } from '@/components/landing/landing-nav'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <ThemeBackground />
      <LandingNav />
      <div className="relative z-10">
        <Hero />
        <div id="themes"><ThemesShowcase /></div>
        <div id="features"><FeaturesBento /></div>
        <LeaderboardPreview />
        <div id="pricing"><Pricing /></div>
        <FinalCta />
      </div>
      <footer className="relative z-10 border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>© 2025 Sudomind · Built for nFactorial Incubator · Made with ❤️ in Almaty</p>
      </footer>
    </div>
  )
}