"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "midnight" | "system";

interface ThemeState {
  mode: ThemeMode;
  resolved: "light" | "dark" | "midnight";
  setMode: (mode: ThemeMode) => void;
  setResolved: (r: "light" | "dark" | "midnight") => void;
}

function detectSystem(): "light" | "dark" | "midnight" {
  if (typeof window === "undefined") return "dark";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      resolved: "dark",
      setMode: (mode) => {
        const resolved = mode === "system" ? detectSystem() : mode;
        set({ mode, resolved });
        applyTheme(resolved);
      },
      setResolved: (resolved) => set({ resolved }),
    }),
    {
      name: "linkmint.theme",
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.resolved);
      },
    },
  ),
);

export function applyTheme(resolved: "light" | "dark" | "midnight") {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", resolved);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "light" ? "#fafafa" : "#0a0a0f");
}

export function useResolvedTheme() {
  const mode = useThemeStore((s) => s.mode);
  const resolved = useThemeStore((s) => s.resolved);
  if (mode === "system") return typeof window === "undefined" ? "dark" : detectSystem();
  return resolved;
}
