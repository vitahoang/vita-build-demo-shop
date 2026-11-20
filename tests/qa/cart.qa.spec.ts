import { expect, test, type Browser } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

async function run(browser: Browser, id: string, body: (page: import("@playwright/test").Page) => Promise<void>) {
  const ctx = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: `/tmp/qa-video-${id}`, size: { width: 1280, height: 720 } },
  });
  const page = await ctx.newPage();
  const video = page.video();
  let failed = false;
  try {
    await body(page);
  } catch (e) {
    failed = true;
    throw e;
  } finally {
    await page.screenshot({ path: `${OUT}/${id}.png` });
    await ctx.close();
    if (failed && video) await video.saveAs(`${OUT}/${id}.webm`);
    fs.rmSync(`/tmp/qa-video-${id}`, { recursive: true, force: true });
  }
}

async function addMug(page: import("@playwright/test").Page) {
  await page.goto(BASE + "/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("tc-102 add product to cart", async ({ browser }) => {
  await run(browser, "tc-102", async (page) => {
    await addMug(page);
    // "Page title" = the header cart link label (the document <title> is static).
    const cartLink = page.getByRole("link", { name: /^Cart, / });
    await expect(cartLink).toHaveAttribute("aria-label", "Cart, 1 item");
    await cartLink.click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(lines).toHaveCount(1);
    await expect(lines.first()).toContainText("Stoneware mug");
    await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
  });
});

test("tc-103 change quantity 1 to 3", async ({ browser }) => {
  await run(browser, "tc-103", async (page) => {
    await addMug(page);
    await page.getByRole("link", { name: /^Cart, / }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const line = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
    const linePrice = (await line.locator(".line-price").innerText()).trim();
    const total = (await page.locator(".cart-summary strong").first().innerText()).trim();
    console.log(`line=${linePrice} total=${total}`);
    expect(linePrice).toBe("$72.00");
    expect(total).toBe("$72.00");
  });
});
