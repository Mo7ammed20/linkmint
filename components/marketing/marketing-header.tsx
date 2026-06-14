import * as React from "react";
import { isAuthenticated } from "@/lib/auth";
import { MarketingHeaderClient } from "@/components/marketing/marketing-header-client";

export async function MarketingHeader() {
  const authed = await isAuthenticated();
  return <MarketingHeaderClient initialAuthed={authed} />;
}
