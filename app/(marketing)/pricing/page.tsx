import * as React from "react";
import type { Metadata } from "next";
import { Pricing } from "@/components/marketing/pricing";
import { FAQ } from "@/components/marketing/faq";
import { CTASection } from "@/components/marketing/cta-section";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple plans, serious value. Start free, upgrade when you're ready.",
};

export default function PricingPage() {
  return (
    <>
      <Pricing />
      <FAQ />
      <CTASection />
    </>
  );
}
