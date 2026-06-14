"use client";

import { create } from "zustand";

interface UIState {
  commandOpen: boolean;
  sidebarOpen: boolean;
  adblockDetected: boolean;
  setCommandOpen: (v: boolean) => void;
  setSidebarOpen: (v: boolean) => void;
  toggleSidebar: () => void;
  setAdblock: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  commandOpen: false,
  sidebarOpen: true,
  adblockDetected: false,
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),
  setAdblock: (adblockDetected) => set({ adblockDetected }),
}));
