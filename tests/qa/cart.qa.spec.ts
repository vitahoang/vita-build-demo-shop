import { expect, test, chromium, type Page } from "@playwright/test";
import fs from "node:fs";

const URL = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

async function run(id: string, fn: (page: Page, shot: () => Promise<void>) => Promise<void>) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: `/tmp/qa-video-${id}`, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  let failed = false;
  try {
    await fn(page, async () => {
      await page.screenshot({ path: `${OUT}/${id}.png` });
    });
  } catch (e) {
    failed = true;
    await page.screenshot({ path: `${OUT}/${id}.png` }).catch(() => {});
    throw e;
  } finally {
    await context.close();
    if (failed && video) await video.saveAs(`${OUT}/${id}.webm`);
    await browser.close();
  }
}

async function addMug(page: Page) {
  await page.goto(URL);
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("tc-1 Add a product to the cart", async () => {
  await run("tc-1", async (page, shot) => {
    await addMug(page);
    const cartLink = page.getByRole("link", { name: /^Cart, \d+ items?$/ });
    await expect(cartLink).toHaveAttribute("aria-label", "Cart, 1 item", { timeout: 5000 }).catch(() => {});
    await cartLink.click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(lines).toHaveCount(1);
    await expect(lines.first()).toContainText("Stoneware mug");
    await shot();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("1");
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  });
});

test("tc-2 Change the quantity in the cart", async () => {
  await run("tc-2", async (page, shot) => {
    await addMug(page);
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    const qty = page.getByRole("spinbutton", { name: "Stoneware mug quantity" });
    const line = page.locator(".line-price");
    const total = page.locator(".cart-summary strong");
    await expect(qty).toHaveValue("3");
    console.log("observed", { qty: await qty.inputValue(), line: await line.innerText(), total: await total.innerText() });
    await shot();
    await expect(line).toHaveText("$72.00");
    await expect(total).toHaveText("$72.00");
  });
});
