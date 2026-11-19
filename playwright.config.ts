import fs from "node:fs";
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

function detectChromiumExecutable(): string | undefined {
  if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
    return process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  }

  // Fallback to locally installed ms-playwright headless/chromium if version differs slightly
  const localAppData = process.env.LOCALAPPDATA;
  if (!localAppData) return undefined;
  const pwDir = path.join(localAppData, "ms-playwright");
  if (!fs.existsSync(pwDir)) return undefined;

  const entries = fs
    .readdirSync(pwDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith("chromium-"))
    .sort((a, b) => b.name.localeCompare(a.name));

  for (const entry of entries) {
    const winExe = path.join(pwDir, entry.name, "chrome-win64", "chrome.exe");
    if (fs.existsSync(winExe)) return winExe;
    const win32Exe = path.join(pwDir, entry.name, "chrome-win", "chrome.exe");
    if (fs.existsSync(win32Exe)) return win32Exe;
  }

  return undefined;
}

const executablePath = detectChromiumExecutable();
const e2ePort = process.env.PLAYWRIGHT_PORT ?? "3210";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;
const useExternalServer = Boolean(process.env.PLAYWRIGHT_BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: process.env.PLAYWRIGHT_OUTPUT_DIR ?? "test-results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [
    {
      name: "chromium-desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "chromium-mobile",
      use: { ...devices["Desktop Chrome"], viewport: { width: 375, height: 812 } },
    },
  ],
  ...(useExternalServer
    ? {}
    : {
        webServer: {
          command: `corepack pnpm --filter @cyber-school/web exec next start --hostname 127.0.0.1 --port ${e2ePort}`,
          url: baseURL,
          reuseExistingServer: false,
          timeout: 60_000,
        },
      }),
});
