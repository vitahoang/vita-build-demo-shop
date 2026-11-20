import { chromium, expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.TARGET_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

let browser: Browser;
test.beforeAll(async () => {
  browser = await chromium.launch();
});
test.afterAll(async () => {
  await browser.close();
});

async function run(id: string, body: (page: Page) => Promise<void>) {
  const context: BrowserContext = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: `${OUT}/video-${id}`, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  let failed = false;
  try {
    await body(page);
    failed = test.info().errors.length > 0; // soft assertions do not throw
  } catch (e) {
    failed = true;
    throw e;
  } finally {
    await page.screenshot({ path: `${OUT}/${id}.png` });
    await context.close();
    if (failed && video) await video.saveAs(`${OUT}/${id}.webm`);
    fs.rmSync(`${OUT}/video-${id}`, { recursive: true, force: true });
  }
}

async function addMug(page: Page) {
  await page.goto(BASE + "/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("TC-102 add product to cart", async () => {
  await run("tc-102", async (page) => {
    await addMug(page);
    // The visible cart indicator in the header carries the "Cart, 1 item" label.
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const rows = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("Stoneware mug");
    await expect(rows.first().locator(".line-price")).toHaveText("$24.00");
  });
});

test("TC-103 change quantity 1 to 3", async () => {
  await run("tc-103", async (page) => {
    await addMug(page);
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const line = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
    const linePrice = (await line.locator(".line-price").innerText()).trim();
    const total = (await page.locator(".cart-summary strong").first().innerText()).trim();
    console.log(`line=${linePrice} total=${total}`);
    expect.soft(linePrice).toBe("$72.00");
    expect.soft(total).toBe("$72.00");
  });
});
