import { defineConfig, devices } from "@playwright/test";

// Runs against a deployed copy: BASE_URL=https://vita-build-demo-shop.vercel.app
export default defineConfig({
  testDir: ".",
  testMatch: "*.qa.spec.ts",
  reporter: "list",
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL,
    ignoreHTTPSErrors: true,
    ...devices["Desktop Chrome"],
    video: { mode: "retain-on-failure", size: { width: 1280, height: 720 } },
  },
});
