"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api-client";

export type UserRole = "user" | "admin";
export type UserPlan = "free" | "pro" | "business" | "enterprise";
export type UserStatus = "active" | "suspended" | "pending";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  role: UserRole;
  plan: UserPlan;
  country: string;
  status: UserStatus;
  totalEarnings: number;
  totalClicks: number;
  totalLinks: number;
  createdAt: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrated: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, "name" | "avatar" | "country">>) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean }>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  hydrated: false,
  error: null,

  hydrate: async () => {
    try {
      const { user } = await api<{ user: User | null }>("/api/auth/me");
      set({ user, isAuthenticated: Boolean(user), hydrated: true });
    } catch {
      set({ user: null, isAuthenticated: false, hydrated: true });
    }
  },

  login: (email, password) =>
    authAndHydrate(set, "/api/auth/login", { email, password }, "Login failed"),

  register: (name, email, password) =>
    authAndHydrate(set, "/api/auth/register", { name, email, password }, "Registration failed"),

  logout: async () => {
    try {
      await api("/api/auth/logout", { method: "POST" });
    } catch {
      // local state clears regardless
    }
    set({ user: null, isAuthenticated: false, error: null });
  },

  updateProfile: async (patch) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api<{ user: User }>("/api/users/me", {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      set({ user: data.user, isLoading: false });
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Update failed";
      set({ isLoading: false, error: message });
      throw e;
    }
  },

  requestPasswordReset: async (email) => {
    try {
      await api("/api/auth/request-reset", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      return { ok: true };
    } catch {
      return { ok: false };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      await api("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password: newPassword }),
      });
      return true;
    } catch {
      return false;
    }
  },
}));

async function authAndHydrate(
  set: (partial: Partial<AuthState>) => void,
  endpoint: string,
  body: Record<string, unknown>,
  fallbackError: string,
): Promise<User> {
  set({ isLoading: true, error: null });
  try {
    await api(endpoint, { method: "POST", body: JSON.stringify(body) });
    const { user } = await api<{ user: User | null }>("/api/auth/me");
    if (!user) throw new Error("Profile fetch failed");
    set({ user, isAuthenticated: true, isLoading: false, error: null });
    return user;
  } catch (e) {
    const message = e instanceof ApiError ? e.message : fallbackError;
    set({ isLoading: false, error: message });
    throw e;
  }
}
