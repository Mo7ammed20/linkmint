import * as React from "react";
import Link from "next/link";
import { AuroraBackground } from "@/components/aurora-background";
import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid min-h-dvh grid-cols-1 lg:grid-cols-2">
      <AuroraBackground className="fixed inset-0 -z-10" intensity="medium" />
      <div className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden border-l border-border/40 bg-card/30 backdrop-blur-xl lg:block">
        <div className="absolute inset-0 grid-pattern opacity-30" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 30% 30%, color-mix(in oklch, var(--primary) 30%, transparent), transparent 60%), radial-gradient(50% 50% at 80% 70%, color-mix(in oklch, var(--accent) 30%, transparent), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="glass-strong rounded-2xl p-6">
            <p className="text-sm leading-relaxed text-foreground/90">
              &ldquo;Linkmint replaced four tools in our stack. The redirect flow alone pays for itself in CPM lift.&rdquo;
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent" />
              <div>
                <p className="text-sm font-semibold">Maya Okonkwo</p>
                <p className="text-xs text-muted-foreground">Head of Growth, Beacon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
