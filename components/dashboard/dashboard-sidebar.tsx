"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  Wallet,
  Settings,
  LogOut,
  Sparkles,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useLinksStore } from "@/stores/links-store";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/links", label: "Links", icon: Link2 },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/earnings", label: "Earnings", icon: Wallet },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const links = useLinksStore((s) => s.links);

  return (
    <aside className="sticky top-0 z-30 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar/80 backdrop-blur-xl md:flex">
      <div className="flex h-16 items-center px-4">
        <Link href="/dashboard">
          <Logo />
        </Link>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-3">
        <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </div>
        <nav className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
                  active && "text-foreground",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 -z-0 rounded-lg bg-sidebar-accent"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                ) : null}
                <Icon className="relative z-10 h-4 w-4" />
                <span className="relative z-10">{item.label}</span>
                {item.href === "/dashboard/links" ? (
                  <Badge variant="secondary" className="ml-auto relative z-10 h-5 px-1.5 text-[10px]">
                    {links.length}
                  </Badge>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 mb-2 flex items-center justify-between px-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Plan
          </span>
          <Badge variant="default" className="h-5 px-1.5 text-[10px] uppercase">
            {user?.plan ?? "free"}
          </Badge>
        </div>
        <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/15 via-accent/5 to-transparent p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Upgrade to Business</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Custom domains, advanced routing, and team roles.
          </p>
          <Link
            href="/pricing"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-foreground/10 px-3 py-1.5 text-xs font-medium hover:bg-foreground/15"
          >
            See plans
          </Link>
        </div>
      </div>
      <Separator />
      <div className="flex items-center gap-2 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex flex-1 items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-sidebar-accent"
            >
              <UserAvatar name={user?.name ?? "User"} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" sideOffset={8} className="w-56">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Profile settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">API access</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout} destructive>
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </div>
    </aside>
  );
}
