import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  reporter: "list",
  workers: 1,
  use: {
    baseURL: process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app",
    ignoreHTTPSErrors: true,
  },
});
