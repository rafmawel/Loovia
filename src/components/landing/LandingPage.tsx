'use client'

import { Navbar } from './sections/Navbar'
import { HeroSection } from './sections/HeroSection'
import { ProblemSection } from './sections/ProblemSection'
import { FeaturesSection } from './sections/FeaturesSection'
import { MockupSection } from './sections/MockupSection'
import { StepsSection } from './sections/StepsSection'
import { PricingSection } from './sections/PricingSection'
import { FAQSection } from './sections/FAQSection'
import { CTASection } from './sections/CTASection'
import { FooterSection } from './sections/FooterSection'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <MockupSection />
      <StepsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  )
}
