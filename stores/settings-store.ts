"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "INR" | "BRL";
export type LengthUnit = "metric" | "imperial";

interface Settings {
  currency: Currency;
  language: string;
  timezone: string;
  lengthUnit: LengthUnit;
  reduceMotion: boolean;
  highContrast: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  payoutAlerts: boolean;
  twoFactor: boolean;
  apiAccess: boolean;
}

interface SettingsState extends Settings {
  set: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  setMany: (patch: Partial<Settings>) => void;
  reset: () => void;
}

const DEFAULTS: Settings = {
  currency: "USD",
  language: "en-US",
  timezone: "auto",
  lengthUnit: "metric",
  reduceMotion: false,
  highContrast: false,
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: true,
  payoutAlerts: true,
  twoFactor: false,
  apiAccess: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,
      set: (key, value) => set({ [key]: value } as Partial<Settings>),
      setMany: (patch) => set({ ...patch }),
      reset: () => set({ ...DEFAULTS }),
    }),
    { name: "linkmint.settings" },
  ),
);
