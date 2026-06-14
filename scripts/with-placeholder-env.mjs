#!/usr/bin/env node
import { spawn } from "node:child_process";

const PLACEHOLDER = "postgresql://placeholder:placeholder@localhost:5432/placeholder";

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = PLACEHOLDER;
  console.warn(
    "[with-placeholder-env] DATABASE_URL was not set; using a placeholder for prisma generate (schema validation only — runtime queries still need a real URL).",
  );
}

const [, , ...args] = process.argv;
if (args.length === 0) {
  console.error("Usage: node scripts/with-placeholder-env.mjs <command> [...args]");
  process.exit(1);
}

const isWindows = process.platform === "win32";
const cmd = isWindows && !args[0].endsWith(".cmd") ? `${args[0]}.cmd` : args[0];

const child = spawn(cmd, args.slice(1), {
  stdio: "inherit",
  env: process.env,
  shell: isWindows,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
