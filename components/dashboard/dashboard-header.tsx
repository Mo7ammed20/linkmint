"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, Plus, Command as CommandIcon, CheckCheck, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { usePlatformStore } from "@/stores/platform-store";
import { formatRelativeTime } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const TITLES: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/links": "Links",
  "/dashboard/analytics": "Analytics",
  "/dashboard/earnings": "Earnings",
  "/dashboard/settings": "Settings",
};

export function DashboardHeader() {
  const pathname = usePathname();
  const setCommandOpen = useUIStore((s) => s.setCommandOpen);
  const notifications = usePlatformStore((s) => s.notifications);
  const markAllRead = usePlatformStore((s) => s.markAllNotificationsRead);
  const markRead = usePlatformStore((s) => s.markNotificationRead);
  const unread = notifications.filter((n) => !n.read).length;

  const title = React.useMemo(() => {
    if (TITLES[pathname]) return TITLES[pathname];
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    if (pathname.startsWith("/dashboard/links")) return "Links";
    return "Dashboard";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border/40 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold">{title}</h1>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Welcome back &mdash; here&apos;s what&apos;s happening with your links.
        </p>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="hidden h-9 min-w-[200px] items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 text-sm text-muted-foreground backdrop-blur-sm transition-colors hover:border-border hover:text-foreground sm:flex md:min-w-[280px]"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search links, analytics, docs…</span>
          <Kbd>
            <CommandIcon className="h-2.5 w-2.5" />K
          </Kbd>
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="glass" size="icon" aria-label="Notifications" className="relative">
              <Bell />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[360px] p-0">
            <div className="flex items-center justify-between p-3">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            </div>
            <Separator />
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                  <Inbox className="h-6 w-6 opacity-50" />
                  No notifications
                </div>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        "cursor-pointer px-3 py-3 transition-colors hover:bg-secondary/40",
                        !n.read && "bg-primary/5",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            "mt-1 h-2 w-2 shrink-0 rounded-full",
                            n.type === "success" && "bg-success",
                            n.type === "info" && "bg-primary",
                            n.type === "warning" && "bg-warning",
                            n.type === "error" && "bg-destructive",
                          )}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                          <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
                            {formatRelativeTime(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </ScrollArea>
            <Separator />
            <div className="p-2">
              <Link
                href="/dashboard/settings"
                className="block rounded-md px-2 py-1.5 text-center text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                Notification settings
              </Link>
            </div>
          </PopoverContent>
        </Popover>

        <Button asChild size="sm" variant="gradient" className="hidden sm:inline-flex">
          <Link href="/dashboard/links">
            <Plus />
            New link
          </Link>
        </Button>
      </div>
    </header>
  );
}
