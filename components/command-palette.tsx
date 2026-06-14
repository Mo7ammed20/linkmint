"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Link2,
  BarChart3,
  Wallet,
  Settings,
  Home,
  Users,
  Megaphone,
  FileText,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  Moon,
  Sun,
  MonitorSmartphone,
  LogOut,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";
import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { Kbd } from "@/components/ui/kbd";

type Action = (router: ReturnType<typeof useRouter>) => void;
const ITEMS: { group: string; items: Array<{ id: string; label: string; icon: React.ComponentType<{ className?: string }>; action: Action }> }[] = [
  { group: "Navigate", items: [
    { id: "go-home", label: "Home", icon: Home, action: (router) => router.push("/") },
    { id: "go-dashboard", label: "Dashboard overview", icon: Home, action: (router) => router.push("/dashboard") },
    { id: "go-links", label: "Links", icon: Link2, action: (router) => router.push("/dashboard/links") },
    { id: "go-analytics", label: "Analytics", icon: BarChart3, action: (router) => router.push("/dashboard/analytics") },
    { id: "go-earnings", label: "Earnings", icon: Wallet, action: (router) => router.push("/dashboard/earnings") },
    { id: "go-settings", label: "Settings", icon: Settings, action: (router) => router.push("/dashboard/settings") },
  ]},
  { group: "Admin", items: [
    { id: "go-admin", label: "Admin overview", icon: ShieldCheck, action: (router) => router.push("/admin") },
    { id: "go-admin-users", label: "Manage users", icon: Users, action: (router) => router.push("/admin/users") },
    { id: "go-admin-ads", label: "Manage ads", icon: Megaphone, action: (router) => router.push("/admin/ads") },
    { id: "go-admin-blog", label: "Blog CMS", icon: FileText, action: (router) => router.push("/admin/blog") },
  ]},
];

export function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setOpen = useUIStore((s) => s.setCommandOpen);
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const setThemeMode = useThemeStore((s) => s.setMode);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const handleOpenChange = React.useCallback((v: boolean) => {
    if (!v) setQuery("");
    setOpen(v);
  }, [setOpen]);

  function run(action: Action) {
    action(router);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0 sm:rounded-2xl">
        <Command className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-border/60 px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search for anything…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
            />
            <Kbd>ESC</Kbd>
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {ITEMS.map((group) => (
              <Command.Group key={group.group} heading={group.group} className="mb-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Command.Item
                      key={item.id}
                      value={`${group.group} ${item.label}`}
                      onSelect={() => run(item.action)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/90 aria-selected:bg-secondary aria-selected:text-foreground"
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1">{item.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 transition-opacity aria-selected:opacity-100" />
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ))}

            <Command.Group heading="Actions" className="mb-1">
              <Command.Item
                value="Create new link"
                onSelect={() => run((r) => r.push("/dashboard/links?new=1"))}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/90 aria-selected:bg-secondary"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="flex-1">Create new link</span>
              </Command.Item>
              <Command.Item
                value="Switch to light theme"
                onSelect={() => {
                  setThemeMode("light");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/90 aria-selected:bg-secondary"
              >
                <Sun className="h-4 w-4" />
                <span className="flex-1">Switch to light theme</span>
              </Command.Item>
              <Command.Item
                value="Switch to dark theme"
                onSelect={() => {
                  setThemeMode("dark");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/90 aria-selected:bg-secondary"
              >
                <Moon className="h-4 w-4" />
                <span className="flex-1">Switch to dark theme</span>
              </Command.Item>
              <Command.Item
                value="Use system theme"
                onSelect={() => {
                  setThemeMode("system");
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/90 aria-selected:bg-secondary"
              >
                <MonitorSmartphone className="h-4 w-4" />
                <span className="flex-1">Use system theme</span>
              </Command.Item>
              <Command.Item
                value="Sign out"
                onSelect={() => {
                  logout();
                  setOpen(false);
                  router.push("/login");
                }}
                className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-destructive aria-selected:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span className="flex-1">Sign out</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
