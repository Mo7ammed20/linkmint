import * as React from "react";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { AuroraBackground } from "@/components/aurora-background";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <AuroraBackground className="fixed inset-0 -z-10" intensity="medium" />
      <MarketingHeader />
      <main className="relative pt-24">{children}</main>
      <MarketingFooter />
    </div>
  );
}
