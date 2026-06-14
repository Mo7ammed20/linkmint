"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api-client";
import {
  type SeedAd,
  type SeedPayout,
  type SeedUser,
  type SeedAuditEntry,
  type SeedNotification,
  type SeedBlogPost,
} from "@/lib/seed";

export type { SeedAd, SeedPayout, SeedUser, SeedAuditEntry, SeedNotification, SeedBlogPost };

export interface PlatformState {
  ads: SeedAd[];
  payouts: SeedPayout[];
  blogPosts: SeedBlogPost[];
  auditLog: SeedAuditEntry[];
  notifications: SeedNotification[];
  users: SeedUser[];
  hydrated: boolean;
  isLoading: boolean;
  lastError?: string;
  hydrate: () => Promise<void>;
  fetchAds: () => Promise<void>;
  fetchPayouts: () => Promise<void>;
  fetchBlog: () => Promise<void>;
  fetchAudit: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  setAd: (id: string, patch: Partial<SeedAd>) => Promise<void>;
  createAd: (ad: Omit<SeedAd, "id" | "createdAt" | "impressions" | "clicks" | "revenue">) => Promise<SeedAd>;
  deleteAd: (id: string) => Promise<void>;
  requestPayout: (amount: number, method: SeedPayout["method"]) => Promise<SeedPayout>;
  advancePayout: (id: string) => Promise<void>;
  saveBlogPost: (post: SeedBlogPost) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
  setUserStatus: (id: string, status: SeedUser["status"]) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  pushAudit: (entry: Omit<SeedAuditEntry, "id" | "createdAt">) => Promise<void>;
}

export const usePlatformStore = create<PlatformState>()((set, get) => ({
  ads: [],
  payouts: [],
  blogPosts: [],
  auditLog: [],
  notifications: [],
  users: [],
  hydrated: false,
  isLoading: false,
  lastError: undefined,

  hydrate: async () => {
    if (get().hydrated || get().isLoading) return;
    set({ isLoading: true });
    try {
      const [blog, notif] = await Promise.all([
        api<{ posts: SeedBlogPost[] }>("/api/blog").catch(() => ({ posts: [] })),
        api<{ notifications: SeedNotification[] }>("/api/notifications").catch(() => ({ notifications: [] })),
      ]);
      set({ blogPosts: blog.posts, notifications: notif.notifications });
    } finally {
      set({ isLoading: false, hydrated: true });
    }
  },

  fetchAds: async () => {
    try {
      const { ads } = await api<{ ads: SeedAd[] }>("/api/ads");
      set({ ads });
    } catch (e) {
      set({ lastError: errMsg(e) });
    }
  },

  fetchPayouts: async () => {
    try {
      const { payouts } = await api<{ payouts: SeedPayout[] }>("/api/payouts");
      set({ payouts });
    } catch (e) {
      set({ lastError: errMsg(e) });
    }
  },

  fetchBlog: async () => {
    try {
      const { posts } = await api<{ posts: SeedBlogPost[] }>("/api/blog");
      set({ blogPosts: posts });
    } catch (e) {
      set({ lastError: errMsg(e) });
    }
  },

  fetchAudit: async () => {
    try {
      const { entries } = await api<{ entries: SeedAuditEntry[] }>("/api/audit");
      set({ auditLog: entries });
    } catch (e) {
      set({ lastError: errMsg(e) });
    }
  },

  fetchNotifications: async () => {
    try {
      const { notifications } = await api<{ notifications: SeedNotification[] }>("/api/notifications");
      set({ notifications });
    } catch (e) {
      set({ lastError: errMsg(e) });
    }
  },

  fetchUsers: async () => {
    try {
      const { users } = await api<{ users: SeedUser[] }>("/api/users");
      set({ users });
    } catch (e) {
      set({ lastError: errMsg(e) });
    }
  },

  setAd: async (id, patch) => {
    const prev = get().ads;
    set({ ads: prev.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
    try {
      const { ad } = await api<{ ad: SeedAd }>(`/api/ads/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      set({ ads: get().ads.map((a) => (a.id === id ? ad : a)) });
    } catch (e) {
      set({ ads: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  createAd: async (ad) => {
    const { ad: created } = await api<{ ad: SeedAd }>("/api/ads", {
      method: "POST",
      body: JSON.stringify(ad),
    });
    set({ ads: [created, ...get().ads] });
    return created;
  },

  deleteAd: async (id) => {
    const prev = get().ads;
    set({ ads: prev.filter((a) => a.id !== id) });
    try {
      await api(`/api/ads/${id}`, { method: "DELETE" });
    } catch (e) {
      set({ ads: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  requestPayout: async (amount, method) => {
    const { payout } = await api<{ payout: SeedPayout }>("/api/payouts", {
      method: "POST",
      body: JSON.stringify({ amount, method }),
    });
    set({ payouts: [payout, ...get().payouts] });
    return payout;
  },

  advancePayout: async (id) => {
    const { payout } = await api<{ payout: SeedPayout }>(`/api/payouts/${id}`, {
      method: "PATCH",
    });
    set({ payouts: get().payouts.map((p) => (p.id === id ? payout : p)) });
  },

  saveBlogPost: async (post) => {
    const exists = get().blogPosts.some((p) => p.id === post.id);
    if (exists) {
      const { post: saved } = await api<{ post: SeedBlogPost }>(`/api/blog/${post.id}`, {
        method: "PATCH",
        body: JSON.stringify(post),
      });
      set({ blogPosts: get().blogPosts.map((p) => (p.id === saved.id ? saved : p)) });
    } else {
      const { post: saved } = await api<{ post: SeedBlogPost }>("/api/blog", {
        method: "POST",
        body: JSON.stringify(post),
      });
      set({ blogPosts: [saved, ...get().blogPosts] });
    }
  },

  deleteBlogPost: async (id) => {
    const prev = get().blogPosts;
    set({ blogPosts: prev.filter((p) => p.id !== id) });
    try {
      await api(`/api/blog/${id}`, { method: "DELETE" });
    } catch (e) {
      set({ blogPosts: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  setUserStatus: async (id, status) => {
    const prev = get().users;
    set({ users: prev.map((u) => (u.id === id ? { ...u, status } : u)) });
    try {
      const { user } = await api<{ user: SeedUser }>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      set({ users: get().users.map((u) => (u.id === id ? user : u)) });
    } catch (e) {
      set({ users: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  markNotificationRead: async (id) => {
    const prev = get().notifications;
    set({ notifications: prev.map((n) => (n.id === id ? { ...n, read: true } : n)) });
    try {
      const { notification } = await api<{ notification: SeedNotification }>(
        `/api/notifications/${id}`,
        { method: "PATCH" },
      );
      set({ notifications: get().notifications.map((n) => (n.id === id ? notification : n)) });
    } catch (e) {
      set({ notifications: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  markAllNotificationsRead: async () => {
    const prev = get().notifications;
    set({ notifications: prev.map((n) => ({ ...n, read: true })) });
    try {
      await Promise.all(
        prev.filter((n) => !n.read).map((n) => api(`/api/notifications/${n.id}`, { method: "PATCH" })),
      );
    } catch (e) {
      set({ notifications: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  pushAudit: async (entry) => {
    const local: SeedAuditEntry = {
      ...entry,
      id: `local_${Date.now()}`,
      createdAt: Date.now(),
    };
    set({ auditLog: [local, ...get().auditLog].slice(0, 200) });
  },
}));

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : "Request failed";
}
