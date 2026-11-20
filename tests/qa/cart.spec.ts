import { expect, test, chromium, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const URL = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

async function run(id: string, body: (page: Page) => Promise<void>) {
  const browser = await chromium.launch();
  const videoDir = path.join(OUT, `.video-${id}`);
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: videoDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  let failed = false;
  try {
    await body(page);
  } catch (e) {
    failed = true;
    await page.screenshot({ path: path.join(OUT, `${id}.png`) }).catch(() => {});
    throw e;
  } finally {
    const video = page.video();
    await context.close();
    if (failed && video) await video.saveAs(path.join(OUT, `${id}.webm`));
    fs.rmSync(videoDir, { recursive: true, force: true });
    await browser.close();
  }
}

async function addMugAndOpenCart(page: Page) {
  await page.goto(URL);
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: "Cart, 1 item" }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
}

test("TC-1 Add a product to the cart", async () => {
  await run("tc-1", async (page) => {
    await addMugAndOpenCart(page);
    const items = page.getByRole("list", { name: "Cart items" });
    await expect(items.getByRole("link", { name: "Stoneware mug" })).toBeVisible();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("1");
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.screenshot({ path: path.join(OUT, "tc-1.png") });
  });
});

test("TC-2 Change the quantity in the cart", async () => {
  await run("tc-2", async (page) => {
    await addMugAndOpenCart(page);
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const line = await page.locator(".line-price").innerText();
    const total = await page.locator(".cart-summary strong").first().innerText();
    console.log(`TC-2 observed line price=${line} total=${total}`);
    await page.screenshot({ path: path.join(OUT, "tc-2.png") });
    expect(line).toBe("$72.00");
    expect(total).toBe("$72.00");
  });
});
