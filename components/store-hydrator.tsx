"use client";

import * as React from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useLinksStore } from "@/stores/links-store";
import { usePlatformStore } from "@/stores/platform-store";
import { useAnalyticsStore } from "@/stores/analytics-store";

export function StoreHydrator({ scope = "user" }: { scope?: "user" | "admin" | "public" }) {
  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const hydrateLinks = useLinksStore((s) => s.hydrate);
  const hydratePlatform = usePlatformStore((s) => s.hydrate);
  const fetchAds = usePlatformStore((s) => s.fetchAds);
  const fetchPayouts = usePlatformStore((s) => s.fetchPayouts);
  const fetchBlog = usePlatformStore((s) => s.fetchBlog);
  const fetchAudit = usePlatformStore((s) => s.fetchAudit);
  const fetchUsers = usePlatformStore((s) => s.fetchUsers);
  const fetchNotifications = usePlatformStore((s) => s.fetchNotifications);
  const fetchAnalytics = useAnalyticsStore((s) => s.fetchAll);

  React.useEffect(() => {
    if (scope === "public") {
      void hydratePlatform();
      return;
    }
    void (async () => {
      await hydrateAuth();
      const { isAuthenticated, user } = useAuthStore.getState();
      if (isAuthenticated) {
        void hydrateLinks();
        void fetchAnalytics(30);
        if (user?.role === "admin") {
          void fetchAds();
          void fetchPayouts();
          void fetchBlog();
          void fetchAudit();
          void fetchUsers();
        } else {
          void fetchPayouts();
          void fetchNotifications();
        }
        void fetchBlog();
      } else {
        void hydratePlatform();
      }
    })();
  }, [
    scope,
    hydrateAuth,
    hydrateLinks,
    hydratePlatform,
    fetchAds,
    fetchPayouts,
    fetchBlog,
    fetchAudit,
    fetchUsers,
    fetchNotifications,
    fetchAnalytics,
  ]);

  return null;
}
