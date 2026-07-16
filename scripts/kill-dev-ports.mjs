import { execSync } from "node:child_process";

const ports = [3000, 3001, 3002, 3003];

for (const port of ports) {
  try {
    const out = execSync(
      `netstat -ano | findstr :${port}`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] },
    );
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
    // no listener on this port
  }
}
