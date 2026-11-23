import { expect, test, chromium } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const URL = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

async function run(id: string, body: (page: import("@playwright/test").Page) => Promise<void>) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: path.join(OUT, `video-${id}`), size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  let failed = false;
  try {
    await body(page);
    failed = test.info().errors.length > 0;
  } catch (e) {
    failed = true;
    throw e;
  } finally {
    await page.screenshot({ path: path.join(OUT, `${id}.png`), fullPage: true });
    const video = page.video();
    await context.close();
    if (failed && video) await video.saveAs(path.join(OUT, `${id}.webm`));
    fs.rmSync(path.join(OUT, `video-${id}`), { recursive: true, force: true });
    await browser.close();
  }
}

async function addMug(page: import("@playwright/test").Page) {
  await page.goto(URL);
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("TC-102: add Stoneware mug to cart", async () => {
  await run("tc-102", async (page) => {
    await addMug(page);
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const rows = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("Stoneware mug");
    await expect(rows.first().locator(".line-price")).toHaveText("$24.00");
  });
});

test("TC-103: change quantity 1 -> 3", async () => {
  await run("tc-103", async (page) => {
    await addMug(page);
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const row = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
    const linePrice = (await row.locator(".line-price").innerText()).trim();
    const total = (await page.locator(".cart-summary > div").first().locator("strong").innerText()).trim();
    console.log(`line=${linePrice} total=${total}`);
    expect.soft(linePrice).toBe("$72.00");
    expect.soft(total).toBe("$72.00");
  });
});
