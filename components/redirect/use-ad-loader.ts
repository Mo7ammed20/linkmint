"use client";

import * as React from "react";

const AD_ZONES = ["zone1", "zone2", "zone3", "zone4", "zone5"];
const MAX_WAIT_MS = 3000;
const CHECK_INTERVAL_MS = 200;

export function useAdLoader() {
  const [adsReady, setAdsReady] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const waitForAds = React.useCallback(async (step: number) => {
    setIsLoading(true);
    setAdsReady(false);

    const deadline = Date.now() + MAX_WAIT_MS;
    while (Date.now() < deadline) {
      const ready = AD_ZONES.every((zoneId) => {
        if (typeof document === "undefined") return true;
        const el = document.getElementById(`ad-step${step}-${zoneId}`);
        if (!el) return true;
        return el.clientHeight > 0;
      });
      if (ready) break;
      await new Promise((r) => setTimeout(r, CHECK_INTERVAL_MS));
    }

    setIsLoading(false);
    setAdsReady(true);
  }, []);

  return { adsReady, isLoading, waitForAds };
}
