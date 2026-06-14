import { promises as fs } from "node:fs";
import path from "node:path";

export interface AdZoneDefinition {
  id: string;
  label: string;
  width: number;
  height: number;
  position: string;
  global?: boolean;
}

export const AD_ZONE_DEFINITIONS: AdZoneDefinition[] = [
  { id: "zone1", label: "Leaderboard", width: 728, height: 90, position: "Top banner" },
  { id: "zone2", label: "Large Rectangle", width: 336, height: 280, position: "Right column · top" },
  { id: "zone3", label: "Medium Rectangle", width: 300, height: 250, position: "Left column · under countdown" },
  { id: "zone4", label: "Half Page", width: 300, height: 600, position: "Right column · bottom" },
  { id: "zone5", label: "Mobile Banner", width: 320, height: 50, position: "Bottom strip · mobile only" },
  { id: "zone6", label: "Wide Skyscraper", width: 160, height: 600, position: "Sidebar · alternate" },
  { id: "zone7", label: "Pop-under", width: 0, height: 0, position: "Global · fires on redirect", global: true },
  { id: "zone8", label: "Social Bar", width: 0, height: 0, position: "Global · top/bottom bar", global: true },
];

export type AdZoneId = (typeof AD_ZONE_DEFINITIONS)[number]["id"];

export type AdCodeMap = Partial<Record<AdZoneId, string>>;

const ADS_TXT_PATH = path.join(process.cwd(), "ads.txt");

const SIZE_HEADER = /^(\d{2,4})\s*[x×]\s*(\d{2,4})\s*$/i;
const POPUNDER_HEADER = /pop\s*-?\s*under/i;
const SOCIALBAR_HEADER = /social\s*-?\s*bar/i;
const KNOWN_NAME_HEADERS: Array<{ pattern: RegExp; zone: AdZoneId }> = [
  { pattern: POPUNDER_HEADER, zone: "zone7" },
  { pattern: SOCIALBAR_HEADER, zone: "zone8" },
];

function isHeaderLine(line: string): { kind: "size" | "name"; w?: number; h?: number; zone?: AdZoneId } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  const size = SIZE_HEADER.exec(trimmed);
  if (size) {
    const w = Number(size[1]);
    const h = Number(size[2]);
    return { kind: "size", w, h };
  }
  for (const { pattern, zone } of KNOWN_NAME_HEADERS) {
    if (pattern.test(trimmed)) {
      return { kind: "name", zone };
    }
  }
  return null;
}

function findZoneBySize(w: number, h: number): AdZoneId | null {
  for (const def of AD_ZONE_DEFINITIONS) {
    if (def.width === w && def.height === h) return def.id;
    if (def.width === h && def.height === w) return def.id;
  }
  const sw = Math.abs(w - 720) < 10 ? 728 : w;
  const sh = h;
  for (const def of AD_ZONE_DEFINITIONS) {
    if (def.width === sw && def.height === sh) return def.id;
    if (def.width === sh && def.height === sw) return def.id;
  }
  return null;
}

export function parseAdsTxt(source: string): AdCodeMap {
  const rawLines = source.split(/\r?\n/);
  const result: AdCodeMap = {};
  let current: AdZoneId | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (!current) return;
    const code = buffer
      .map((l) => l)
      .join("\n")
      .replace(/^\s+|\s+$/g, "")
      .replace(/^\n+|\n+$/g, "");
    if (code.length > 0) {
      result[current] = code;
    }
    current = null;
    buffer = [];
  };

  for (const raw of rawLines) {
    const header = isHeaderLine(raw);
    if (header) {
      flush();
      if (header.kind === "name" && header.zone) {
        current = header.zone;
      } else if (header.kind === "size" && header.w != null && header.h != null) {
        const id = findZoneBySize(header.w, header.h);
        if (id) current = id;
      }
      continue;
    }
    if (current) {
      buffer.push(raw);
    }
  }
  flush();
  return result;
}

export async function readAdsTxt(): Promise<AdCodeMap> {
  try {
    const raw = await fs.readFile(ADS_TXT_PATH, "utf8");
    return parseAdsTxt(raw);
  } catch {
    return {};
  }
}

export async function writeAdsTxt(map: AdCodeMap): Promise<void> {
  const lines: string[] = [
    "# ─────────────────────────────────────────────────────────────────────────────",
    "# Linkmint — ads.txt",
    "# Ad code is grouped by header. Headers are either a size (e.g. 728 x 90)",
    "# or a known name (pop under, social bar).",
    "# Edit by hand or via /admin/ads. Both stay in sync.",
    "# ─────────────────────────────────────────────────────────────────────────────",
    "",
  ];
  for (const def of AD_ZONE_DEFINITIONS) {
    if (def.global) {
      lines.push(`${def.label.toLowerCase()}`);
    } else {
      lines.push(`${def.width} x ${def.height}`);
    }
    const code = (map[def.id] ?? "").trim();
    if (code.length === 0) {
      lines.push("# (empty — zone disabled)");
    } else {
      lines.push(code);
    }
    lines.push("");
  }
  await fs.writeFile(ADS_TXT_PATH, lines.join("\n"), "utf8");
}
