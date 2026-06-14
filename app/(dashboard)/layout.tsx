import * as React from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/command-palette";
import { AdBlockDetector } from "@/components/adblock-detector";
import { AuroraBackground } from "@/components/aurora-background";
import { StoreHydrator } from "@/components/store-hydrator";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      <AuroraBackground className="fixed inset-0 -z-10" intensity="low" showGrid={false} showNoise={false} />
      <div className="flex">
        <DashboardSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
        </div>
      </div>
      <CommandPalette />
      <AdBlockDetector />
      <StoreHydrator scope="user" />
    </div>
  );
}
