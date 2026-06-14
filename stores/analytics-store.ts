"use client";

import { create } from "zustand";
import { api } from "@/lib/api-client";

export interface TimeSeriesPoint {
  date: string;
  clicks: number;
  revenue: number;
}

export interface CountryData {
  code: string;
  name: string;
  flag: string;
  clicks: number;
}

export interface ShareData {
  name: string;
  share: number;
  clicks: number;
}

interface AnalyticsState {
  series: TimeSeriesPoint[];
  countries: CountryData[];
  devices: ShareData[];
  browsers: ShareData[];
  referrers: ShareData[];
  isLoading: boolean;
  days: number;
  fetchAll: (days?: number) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  series: [],
  countries: [],
  devices: [],
  browsers: [],
  referrers: [],
  isLoading: false,
  days: 30,

  fetchAll: async (days = 30) => {
    set({ isLoading: true, days });
    try {
      const [ts, co, de, br, re] = await Promise.all([
        api<{ series: TimeSeriesPoint[] }>(`/api/analytics/timeseries?days=${days}`),
        api<{ countries: CountryData[] }>("/api/analytics/countries"),
        api<{ devices: ShareData[] }>("/api/analytics/devices"),
        api<{ browsers: ShareData[] }>("/api/analytics/browsers"),
        api<{ referrers: ShareData[] }>("/api/analytics/referrers"),
      ]);
      set({
        series: ts.series,
        countries: co.countries,
        devices: de.devices,
        browsers: br.browsers,
        referrers: re.referrers,
        isLoading: false,
      });
    } catch (err) {
      console.error("[analytics] fetchAll failed", err);
      set({ isLoading: false });
    }
  },
}));
