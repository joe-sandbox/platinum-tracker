import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const apiDirectory = path.resolve(configDirectory, "../api");
const e2eDataDirectory = path.resolve(configDirectory, "../../.cache/e2e");

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: [
        `cd "${apiDirectory}"`,
        `PLATINUM_TRACKER_PROJECT_ROOT="${e2eDataDirectory}" uv run alembic upgrade head`,
        `PLATINUM_TRACKER_PROJECT_ROOT="${e2eDataDirectory}" PLATINUM_TRACKER_API_PORT=8001 uv run platinum-tracker-api`,
      ].join(" && "),
      url: "http://127.0.0.1:8001/api/health",
      reuseExistingServer: false,
    },
    {
      command:
        "VITE_API_URL=http://127.0.0.1:8001 pnpm dev --host 127.0.0.1 --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
    },
  ],
});
