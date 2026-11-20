import { type Browser, type BrowserContext, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

export const BASE_URL = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
export const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

export async function openCase(browser: Browser) {
  fs.mkdirSync(OUT, { recursive: true });
  const videoDir = fs.mkdtempSync(path.join(process.env.TMPDIR ?? "/tmp", "qa-video-"));
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  return { context, page, videoDir };
}

export async function closeCase(
  context: BrowserContext,
  page: Page,
  id: string,
  passed: boolean,
) {
  const video = page.video();
  await context.close();
  if (!passed && video) await video.saveAs(path.join(OUT, `${id}.webm`));
}

export async function addMugAndOpenCart(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: /^Cart/ }).click();
}
