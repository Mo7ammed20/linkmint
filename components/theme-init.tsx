"use client";

import * as React from "react";
import { useThemeStore } from "@/stores/theme-store";
import { applyTheme } from "@/stores/theme-store";

export function ThemeInit() {
  React.useEffect(() => {
    const state = useThemeStore.getState();
    applyTheme(state.resolved);
    if (state.mode === "system" && typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => {
        const r = mq.matches ? "dark" : "light";
        useThemeStore.setState({ resolved: r });
        applyTheme(r);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, []);
  return null;
}
