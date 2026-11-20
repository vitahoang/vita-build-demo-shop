import { chromium, expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

const BASE = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

async function run(id: string, body: (page: Page) => Promise<void>) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: `${OUT}/video-${id}`, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  let error: unknown;
  try {
    await body(page);
  } catch (e) {
    error = e;
    await page.screenshot({ path: `${OUT}/${id}.png`, fullPage: true });
  }
  await context.close();
  if (error) await video?.saveAs(`${OUT}/${id}.webm`);
  await browser.close();
  if (error) throw error;
}

async function addMug(page: Page) {
  await page.goto(BASE);
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "Cart, 1 item" }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
}

test("tc-1 Add a product to the cart", async () => {
  await run("tc-1", async (page) => {
    await addMug(page);
    const items = page.getByRole("list", { name: "Cart items" });
    await expect(items.getByRole("link", { name: "Stoneware mug" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("1");
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.screenshot({ path: `${OUT}/tc-1.png`, fullPage: true });
  });
});

test("tc-2 Change the quantity in the cart", async () => {
  await run("tc-2", async (page) => {
    await addMug(page);
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const line = await page.locator(".line-price").innerText();
    const total = await page.locator(".cart-summary strong").innerText();
    console.log(`line=${line} total=${total}`);
    await page.screenshot({ path: `${OUT}/tc-2.png`, fullPage: true });
    expect(line).toBe("$72.00");
    expect(total).toBe("$72.00");
  });
});
