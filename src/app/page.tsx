import { GlobalNavbar } from '@/components/layout/global-navbar'
import { Hero } from '@/components/landing/hero'
import { ThemesShowcase } from '@/components/landing/themes-showcase'
import { FeaturesBento } from '@/components/landing/features-bento'
import { LeaderboardPreview } from '@/components/landing/leaderboard-preview'
import { Pricing } from '@/components/landing/pricing'
import { FinalCta } from '@/components/landing/final-cta'
import { ThemeBackground } from '@/components/theme-backgrounds'

export default function LandingPage() {
  return (
    <div className="min-h-screen relative overflow-hidden pb-16 md:pb-0">
      <ThemeBackground />
      {/* isGuest = true → показывает Features/Themes/Pricing/Leaderboard + Sign In */}
      <GlobalNavbar isGuest={true} />
      <div className="relative z-10">
        <Hero />
        <div id="themes"><ThemesShowcase /></div>
        <div id="features"><FeaturesBento /></div>
        <LeaderboardPreview />
        <div id="pricing"><Pricing /></div>
        <FinalCta />
      </div>
      <footer className="relative z-10 border-t border-border/40 py-6 text-center text-sm text-muted-foreground">
        © 2025 Sudomind · nFactorial Incubator · Made in Almaty 🇰🇿
      </footer>
    </div>
  )
}