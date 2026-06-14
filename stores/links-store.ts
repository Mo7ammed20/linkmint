"use client";

import { create } from "zustand";
import { api, ApiError } from "@/lib/api-client";

export type LinkStatus = "active" | "paused" | "expired" | "disabled";

export interface Link {
  id: string;
  userId: string;
  shortCode: string;
  destination: string;
  title: string | null;
  description: string | null;
  tags: string[];
  status: LinkStatus;
  expiresAt: string | null;
  passwordHash: string | null;
  customAlias: boolean;
  clicks: number;
  earnings: number;
  createdAt: string;
  updatedAt: string;
  lastClickedAt: string | null;
}

export interface CreateLinkInput {
  destination: string;
  customAlias?: string;
  title?: string;
  description?: string;
  tags?: string[];
  expiresAt?: number;
  password?: string;
}

interface LinksState {
  links: Link[];
  hydrated: boolean;
  isCreating: boolean;
  isLoading: boolean;
  lastError?: string;
  hydrate: () => Promise<void>;
  createLink: (input: CreateLinkInput) => Promise<Link>;
  updateLink: (id: string, patch: Partial<Link>) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
  deleteLinks: (ids: string[]) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
  bulkUpdate: (ids: string[], patch: Partial<Link>) => Promise<void>;
  resolveCode: (code: string) => Link | undefined;
}

export const useLinksStore = create<LinksState>()((set, get) => ({
  links: [],
  hydrated: false,
  isCreating: false,
  isLoading: false,
  lastError: undefined,

  hydrate: async () => {
    if (get().hydrated || get().isLoading) return;
    set({ isLoading: true });
    try {
      const { links } = await api<{ links: Link[] }>("/api/links");
      set({ links, hydrated: true, isLoading: false });
    } catch (e) {
      set({ isLoading: false, lastError: errMsg(e) });
    }
  },

  createLink: async (input) => {
    set({ isCreating: true, lastError: undefined });
    try {
      const { link } = await api<{ link: Link }>("/api/links", {
        method: "POST",
        body: JSON.stringify(input),
      });
      set({ links: [link, ...get().links], isCreating: false });
      return link;
    } catch (e) {
      set({ isCreating: false, lastError: errMsg(e) });
      throw e;
    }
  },

  updateLink: async (id, patch) => {
    const prev = get().links;
    set({ links: prev.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
    try {
      const { link } = await api<{ link: Link }>(`/api/links/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      set({ links: get().links.map((l) => (l.id === id ? link : l)) });
    } catch (e) {
      set({ links: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  deleteLink: async (id) => {
    const prev = get().links;
    set({ links: prev.filter((l) => l.id !== id) });
    try {
      await api(`/api/links/${id}`, { method: "DELETE" });
    } catch (e) {
      set({ links: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  deleteLinks: async (ids) => {
    const prev = get().links;
    const set1 = new Set(ids);
    set({ links: prev.filter((l) => !set1.has(l.id)) });
    try {
      await Promise.all(ids.map((id) => api(`/api/links/${id}`, { method: "DELETE" })));
    } catch (e) {
      set({ links: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  toggleStatus: async (id) => {
    const link = get().links.find((l) => l.id === id);
    if (!link) return;
    const next: LinkStatus = link.status === "active" ? "paused" : "active";
    await get().updateLink(id, { status: next } as Partial<Link>);
  },

  bulkUpdate: async (ids, patch) => {
    const prev = get().links;
    const set1 = new Set(ids);
    set({ links: prev.map((l) => (set1.has(l.id) ? { ...l, ...patch } : l)) });
    try {
      await Promise.all(
        ids.map((id) =>
          api(`/api/links/${id}`, {
            method: "PATCH",
            body: JSON.stringify(patch),
          }),
        ),
      );
    } catch (e) {
      set({ links: prev, lastError: errMsg(e) });
      throw e;
    }
  },

  resolveCode: (code) => get().links.find((l) => l.shortCode === code),
}));

function errMsg(e: unknown): string {
  return e instanceof ApiError ? e.message : "Request failed";
}
