import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";

const ports = [3000, 3001, 3002, 3003];

for (const port of ports) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "ignore"],
    });
    const pids = new Set(
      out
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/).pop())
        .filter((pid) => pid && /^\d+$/.test(pid)),
    );
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`Stopped process ${pid} on port ${port}`);
      } catch {
        // already exited
      }
    }
  } catch {
    // no listener
  }
}

function rm(target) {
  try {
    if (process.platform === "win32") {
      try {
        execSync(`cmd /c rmdir "${target}"`, { stdio: "ignore" });
      } catch {
        // not a junction
      }
    }
    fs.rmSync(target, { recursive: true, force: true });
    console.log(`Removed ${target}`);
  } catch (err) {
    console.warn(`Could not remove ${target}:`, err.message);
  }
}

rm(path.join(process.cwd(), ".next"));

const cacheRoot =
  process.env.LOCALAPPDATA ||
  process.env.XDG_CACHE_HOME ||
  path.join(os.homedir(), ".cache");
rm(path.join(cacheRoot, "edubite", "next-cache"));

// Undo accidental tsconfig include from failed off-desktop distDir experiments
const tsconfigPath = path.join(process.cwd(), "tsconfig.json");
try {
  const raw = fs.readFileSync(tsconfigPath, "utf8");
  const json = JSON.parse(raw);
  if (Array.isArray(json.include)) {
    json.include = json.include.filter(
      (entry) => !String(entry).includes("AppData") && !String(entry).includes("next-cache"),
    );
    fs.writeFileSync(tsconfigPath, `${JSON.stringify(json, null, 2)}\n`);
    console.log("Cleaned tsconfig include paths");
  }
} catch {
  // ignore
}
