"use client";

import * as React from "react";
import { ShieldAlert, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "linkmint.adblock.gate.dismissed";

export function detectAdBlocker(): boolean {
  if (typeof document === "undefined") return false;
  const bait = document.getElementById("ad-detect-bait");
  if (!bait) return false;
  if (bait.offsetHeight === 0) return true;
  if (bait.offsetParent === null) return true;
  if (window.getComputedStyle(bait).display === "none") return true;
  return false;
}

export function AdBlockerGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<"ok" | "blocked">("ok");
  const ranRef = React.useRef(false);

  React.useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    if (typeof window === "undefined") return;
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    window.setTimeout(() => {
      if (dismissed) {
        setStatus("ok");
        return;
      }
      const blocked = detectAdBlocker();
      setStatus(blocked ? "blocked" : "ok");
    }, 1500);
  }, []);

  if (status === "blocked") {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 text-center text-white p-8">
        <div className="max-w-md space-y-4">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold">Ad Blocker Detected</h2>
          <p className="text-gray-300">
            Please disable your ad blocker to continue. This supports the creators whose content you enjoy.
          </p>
          <Button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem(STORAGE_KEY, "1");
              }
              window.location.reload();
            }}
            className="px-6 py-3 bg-white text-black hover:bg-gray-100"
            size="lg"
          >
            <RefreshCcw className="h-4 w-4" />
            I&apos;ve disabled it — Continue
          </Button>
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.localStorage.setItem(STORAGE_KEY, "1");
              }
              setStatus("ok");
            }}
            className="block w-full text-xs text-gray-400 underline-offset-2 hover:underline"
          >
            Continue anyway
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
