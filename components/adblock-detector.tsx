"use client";

import * as React from "react";
import { ShieldAlert, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const STORAGE_KEY = "linkmint.adblock.dismissed";

export function AdBlockDetector() {
  const [detected, setDetected] = React.useState(false);
  const setAdblock = useUIStore((s) => s.setAdblock);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY);
    if (dismissed === "1") return;

    const detector = document.createElement("div");
    detector.className = "ad-banner ad-placement";
    detector.style.position = "absolute";
    detector.style.left = "-9999px";
    detector.style.width = "1px";
    detector.style.height = "1px";
    detector.innerHTML = "&nbsp;";
    document.body.appendChild(detector);

    const checkAdb = () => {
      const blocked =
        detector.offsetHeight === 0 ||
        window.getComputedStyle(detector).display === "none" ||
        (window as unknown as { __adBlockDetected?: boolean }).__adBlockDetected === true;
      if (blocked) {
        setDetected(true);
        setAdblock(true);
      }
    };

    setTimeout(checkAdb, 1200);
    const interval = setInterval(checkAdb, 6000);
    return () => {
      clearInterval(interval);
      detector.remove();
    };
  }, [setAdblock]);

  function dismiss() {
    setDetected(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }

  return (
    <Dialog open={detected} onOpenChange={(v) => !v && dismiss()}>
      <DialogContent className="max-w-md">
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold">We noticed an ad blocker</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Linkmint stays free because of non-intrusive ads shown to visitors on the redirect page. Disabling your
              ad blocker helps fund the creators you follow &mdash; at no cost to you.
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                No data is sold to third parties
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                Ads are clearly marked and never on the dashboard
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                You can dismiss this message at any time
              </li>
            </ul>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="ghost" size="sm" onClick={dismiss}>
                Continue with ad blocker
              </Button>
              <Button variant="gradient" size="sm" onClick={dismiss}>
                <RefreshCcw />
                I&apos;ve disabled it &mdash; try again
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
