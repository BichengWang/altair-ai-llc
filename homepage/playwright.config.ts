import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      "VITE_LLM_API_KEY=playwright-test-key VITE_LLM_MODEL=gpt-5.4 npm run dev -- --host 127.0.0.1 --port 4174",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
  },
});
