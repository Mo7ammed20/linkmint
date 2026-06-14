import * as React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AuroraBackground } from "@/components/aurora-background";
import { CommandPalette } from "@/components/command-palette";
import { AdBlockDetector } from "@/components/adblock-detector";
import { StoreHydrator } from "@/components/store-hydrator";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      <AuroraBackground className="fixed inset-0 -z-10" intensity="low" showGrid={false} showNoise={false} />
      <div className="flex">
        <AdminSidebar />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
      <CommandPalette />
      <AdBlockDetector />
      <StoreHydrator scope="admin" />
    </div>
  );
}
