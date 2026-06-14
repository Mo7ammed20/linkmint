"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuroraBackground } from "@/components/aurora-background";

export function LinkNotFound({ code }: { code: string }) {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-6">
      <AuroraBackground className="fixed inset-0 -z-10" />
      <div className="glass-strong relative max-w-md rounded-2xl p-8 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-warning/15 text-warning">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-xl font-semibold">Link not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link /r/{code} doesn&apos;t exist, has been disabled, or has expired.
        </p>
        <Button asChild className="mt-5" variant="gradient">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  );
}
