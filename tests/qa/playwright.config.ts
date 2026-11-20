import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app",
    ignoreHTTPSErrors: true,
  },
});
