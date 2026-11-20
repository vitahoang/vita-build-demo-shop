import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";

export const BASE_URL = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
export const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

export async function openCase(id: string) {
  const browser: Browser = await chromium.launch();
  const context: BrowserContext = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: `/tmp/qa-video-${id}`, size: { width: 1280, height: 720 } },
  });
  const page: Page = await context.newPage();
  return { browser, context, page };
}

export async function addMugToCart(page: Page) {
  await page.goto(BASE_URL + "/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await page.getByRole("heading", { name: "Stoneware mug" }).waitFor();
  await page.getByRole("button", { name: "Add to cart" }).click();
}
