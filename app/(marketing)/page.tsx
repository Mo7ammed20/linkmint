import * as React from "react";
import { Hero } from "@/components/marketing/hero";
import { LogoCloud } from "@/components/marketing/logo-cloud";
import { Features } from "@/components/marketing/features";
import { RevenueCalculator } from "@/components/marketing/revenue-calculator";
import { AnalyticsShowcase } from "@/components/marketing/analytics-showcase";
import { Testimonials } from "@/components/marketing/testimonials";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { CTASection } from "@/components/marketing/cta-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogoCloud />
      <Features />
      <RevenueCalculator />
      <AnalyticsShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
    </>
  );
}
