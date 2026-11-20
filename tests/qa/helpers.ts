import { chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const BASE_URL = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
export const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

/** Runs body in a fresh context (ignoreHTTPSErrors, video recorded); keeps the video only if body throws. */
export async function runCase(id: string, body: (page: Page, shot: () => Promise<void>) => Promise<void>) {
  fs.mkdirSync(OUT, { recursive: true });
  const videoDir = fs.mkdtempSync(path.join("/tmp", `qa-${id}-`));
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  const shot = async () => {
    await page.screenshot({ path: path.join(OUT, `${id}.png`), fullPage: true });
  };
  let error: unknown;
  try {
    await body(page, shot);
  } catch (e) {
    error = e;
    await shot().catch(() => {});
  }
  await context.close();
  if (error && video) await video.saveAs(path.join(OUT, `${id}.webm`));
  await browser.close();
  if (error) throw error;
}
