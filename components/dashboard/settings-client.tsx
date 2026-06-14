"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Lock,
  Bell,
  Key,
  CreditCard,
  Plug,
  ChevronRight,
  Camera,
  Check,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  bio: z.string().max(160).optional(),
  website: z.string().optional(),
});
type ProfileData = z.infer<typeof profileSchema>;

const SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "api", label: "API access", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations", icon: Plug },
] as const;

export function SettingsClient() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const [section, setSection] = React.useState<typeof SECTIONS[number]["id"]>("profile");
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
      <aside>
        <Card className="p-2">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = s.id === section;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50",
                )}
              >
                <span className="inline-flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {s.label}
                </span>
                <ChevronRight className={cn("h-3.5 w-3.5 transition-opacity", active ? "opacity-100" : "opacity-0")} />
              </button>
            );
          })}
        </Card>
      </aside>

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className="space-y-4"
        >
          {section === "profile" ? <ProfileSection /> : null}
          {section === "security" ? <SecuritySection /> : null}
          {section === "notifications" ? <NotificationsSection /> : null}
          {section === "api" ? <ApiSection /> : null}
          {section === "billing" ? <BillingSection /> : null}
          {section === "integrations" ? <IntegrationsSection /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      bio: "Building the most beautiful link platform in the world.",
      website: "https://linkmint.io",
    },
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <UserAvatar name={user?.name ?? "User"} className="h-16 w-16" />
          <button
            type="button"
            className="absolute bottom-0 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow"
            aria-label="Upload avatar"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div>
          <h2 className="text-base font-semibold">Profile</h2>
          <p className="text-xs text-muted-foreground">Update how you appear on Linkmint.</p>
        </div>
      </div>
      <Separator className="my-6" />
      <form
        onSubmit={handleSubmit((data) => {
          updateProfile({ name: data.name });
          toast.success("Profile updated");
        })}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register("email")} />
            {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea rows={3} {...register("bio")} />
        </div>
        <div className="space-y-1.5">
          <Label>Website</Label>
          <Input {...register("website")} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="reset">Cancel</Button>
          <Button type="submit" variant="gradient" disabled={!isDirty}>
            <Check /> Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function SecuritySection() {
  const settings = useSettingsStore();
  return (
    <div className="space-y-3">
      <Card className="p-6">
        <h2 className="text-base font-semibold">Password</h2>
        <p className="mt-1 text-xs text-muted-foreground">Update your password regularly.</p>
        <Separator className="my-4" />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Password updated");
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="space-y-1.5">
            <Label>Current</Label>
            <Input type="password" />
          </div>
          <div className="space-y-1.5">
            <Label>New</Label>
            <Input type="password" />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm</Label>
            <Input type="password" />
          </div>
          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" variant="gradient">Update password</Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Two-factor authentication</h2>
            <p className="mt-1 text-xs text-muted-foreground">Add an extra layer of security.</p>
          </div>
          <Switch
            checked={settings.twoFactor}
            onCheckedChange={(v) => {
              settings.set("twoFactor", v);
              toast.success(v ? "2FA enabled" : "2FA disabled");
            }}
          />
        </div>
        {settings.twoFactor ? (
          <>
            <Separator className="my-4" />
            <div className="rounded-lg border border-border/60 bg-card/40 p-4">
              <p className="text-sm font-medium">Authenticator app</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan the QR code with your authenticator app, then enter the 6-digit code.
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="grid h-24 w-24 place-items-center rounded-lg bg-foreground p-1">
                  <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-px">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const isDark = ((i * 7 + (i >> 3) * 13) % 11) > 4;
                      return (
                        <div
                          key={i}
                          className={cn("rounded-[1px]", isDark ? "bg-background" : "bg-transparent")}
                        />
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Verification code</Label>
                  <Input placeholder="123 456" className="w-32 text-center font-mono" />
                  <Button size="sm" variant="gradient">Verify</Button>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold">Active sessions</h2>
        <p className="mt-1 text-xs text-muted-foreground">Devices currently signed in to your account.</p>
        <Separator className="my-4" />
        <ul className="space-y-2">
          {[
            { device: "MacBook Pro · Chrome", ip: "73.142.21.88", location: "Brooklyn, NY", current: true, last: "now" },
            { device: "iPhone 16 Pro · Safari", ip: "73.142.21.88", location: "Brooklyn, NY", current: false, last: "2h ago" },
            { device: "iPad · Safari", ip: "104.18.42.6", location: "Brooklyn, NY", current: false, last: "3d ago" },
          ].map((s, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3"
            >
              <div>
                <p className="text-sm font-medium">{s.device}</p>
                <p className="text-xs text-muted-foreground">
                  {s.location} · {s.ip} · {s.last}
                </p>
              </div>
              {s.current ? (
                <Badge variant="success" className="border-0">Current</Badge>
              ) : (
                <Button variant="ghost" size="sm">Revoke</Button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function NotificationsSection() {
  const settings = useSettingsStore();
  const items: Array<{ key: keyof typeof settings & string; label: string; description: string }> = [
    { key: "emailNotifications", label: "Email notifications", description: "Receive updates about your account." },
    { key: "pushNotifications", label: "Push notifications", description: "Real-time alerts in your browser." },
    { key: "weeklyDigest", label: "Weekly digest", description: "Summary of your link performance." },
    { key: "payoutAlerts", label: "Payout alerts", description: "Notify me on every payout." },
  ];
  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold">Notifications</h2>
      <p className="mt-1 text-xs text-muted-foreground">Decide what we tell you about.</p>
      <Separator className="my-4" />
      <ul className="divide-y divide-border/40">
        {items.map((item) => {
          const value = (settings as unknown as Record<string, unknown>)[item.key];
          return (
            <li key={item.key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={Boolean(value)}
                onCheckedChange={(v) =>
                  (settings.set as unknown as (k: string, val: unknown) => void)(item.key, v)
                }
              />
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ApiSection() {
  const [key] = React.useState("lm_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7");
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="space-y-3">
      <Card className="p-6">
        <h2 className="text-base font-semibold">Personal access token</h2>
        <p className="mt-1 text-xs text-muted-foreground">Use this to authenticate against the Linkmint API.</p>
        <Separator className="my-4" />
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/40 p-2">
          <code className="flex-1 truncate px-2 font-mono text-xs">{key}</code>
          <Button
            size="sm"
            variant="glass"
            onClick={() => {
              navigator.clipboard.writeText(key);
              setCopied(true);
              toast.success("API key copied");
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <Check /> : null}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="text-base font-semibold">Webhooks</h2>
        <p className="mt-1 text-xs text-muted-foreground">Send real-time events to your own services.</p>
        <Separator className="my-4" />
        <div className="rounded-lg border border-border/60 bg-card/40 p-4">
          <p className="text-sm font-medium">No webhooks configured</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a URL to receive click, conversion, and payout events.
          </p>
          <Button size="sm" variant="gradient" className="mt-3">
            Add endpoint
          </Button>
        </div>
      </Card>
    </div>
  );
}

function BillingSection() {
  return (
    <div className="space-y-3">
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold">Current plan</h2>
            <p className="mt-1 text-xs text-muted-foreground">Pro · Billed monthly</p>
          </div>
          <Badge>Pro</Badge>
        </div>
        <Separator className="my-4" />
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">Next invoice</dt>
            <dd className="mt-1 text-sm font-medium">$19.00 on Jul 14</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Payment method</dt>
            <dd className="mt-1 text-sm font-medium">Visa · 4242</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Billing email</dt>
            <dd className="mt-1 text-sm font-medium">alex@studio.dev</dd>
          </div>
        </dl>
        <div className="mt-4 flex gap-2">
          <Button variant="glass" size="sm">Update payment method</Button>
          <Button variant="ghost" size="sm">View invoices</Button>
        </div>
      </Card>
    </div>
  );
}

function IntegrationsSection() {
  const items = [
    { name: "Zapier", description: "Connect Linkmint to 5,000+ apps.", connected: true },
    { name: "Slack", description: "Send click alerts to your channels.", connected: true },
    { name: "Discord", description: "Webhook into your community.", connected: false },
    { name: "Google Analytics", description: "Forward events to GA4.", connected: false },
    { name: "Make", description: "Build complex workflows.", connected: false },
  ];
  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold">Integrations</h2>
      <p className="mt-1 text-xs text-muted-foreground">Connect Linkmint to the tools you already use.</p>
      <Separator className="my-4" />
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li
            key={i.name}
            className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-4"
          >
            <div>
              <p className="text-sm font-semibold">{i.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{i.description}</p>
            </div>
            <Button size="sm" variant={i.connected ? "glass" : "gradient"}>
              {i.connected ? "Manage" : "Connect"}
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
