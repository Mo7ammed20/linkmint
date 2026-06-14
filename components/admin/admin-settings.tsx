"use client";

import * as React from "react";
import { Save, Globe, Webhook, ShieldCheck, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export function AdminSettings() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Platform settings</h2>
        <p className="text-sm text-muted-foreground">Configure the Linkmint platform.</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="adblock">Ad-block</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card className="p-6">
            <h3 className="text-base font-semibold">General</h3>
            <p className="mt-1 text-xs text-muted-foreground">Branding and platform defaults.</p>
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Platform name</Label>
                <Input defaultValue="Linkmint" />
              </div>
              <div className="space-y-1.5">
                <Label>Support email</Label>
                <Input defaultValue="hello@linkmint.io" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Tagline</Label>
                <Input defaultValue="Shorten links. Maximize revenue." />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Footer notice</Label>
                <Textarea defaultValue="Crafted with care by the Linkmint team." rows={2} />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="gradient" onClick={() => toast.success("Settings saved")}>
                <Save /> Save changes
              </Button>
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="domains">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <h3 className="text-base font-semibold">Custom domains</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Domains available to all users as short-link hosts.
            </p>
            <Separator className="my-4" />
            <ul className="space-y-2">
              {["go.linkmint.io", "lm.to", "link.zip"].map((d) => (
                <li
                  key={d}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-card/40 p-3"
                >
                  <span className="font-mono text-sm">{d}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="border-0">SSL valid</Badge>
                    <Button size="sm" variant="ghost">Manage</Button>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="glass" size="sm" className="mt-3">
              Add domain
            </Button>
          </Card>
        </TabsContent>
        <TabsContent value="webhooks">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              <h3 className="text-base font-semibold">System webhooks</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Outbound notifications for platform-level events.
            </p>
            <Separator className="my-4" />
            <div className="rounded-lg border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
              No system webhooks configured.
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="adblock">
          <Card className="p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <h3 className="text-base font-semibold">Ad-block detection</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              How the platform asks visitors to support creators.
            </p>
            <Separator className="my-4" />
            <ul className="space-y-3">
              {[
                { label: "Detect blocked ad containers", default: true },
                { label: "Detect blocked ad scripts", default: true },
                { label: "Show transparent messaging modal", default: true },
                { label: "Track detection analytics", default: true },
                { label: "Auto-redirect after warning", default: false },
              ].map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </li>
              ))}
            </ul>
            <Separator className="my-4" />
            <div className="space-y-1.5">
              <Label>Custom message</Label>
              <Textarea
                defaultValue="Linkmint stays free because of non-intrusive ads. Disabling your ad blocker helps fund the creators you follow."
                rows={3}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="gradient" onClick={() => toast.success("Ad-block settings saved")}>
                <Save /> Save changes
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
