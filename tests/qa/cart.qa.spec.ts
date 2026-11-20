import { chromium, expect, test, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";
let browser: Browser;

test.beforeAll(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  browser = await chromium.launch();
});
test.afterAll(async () => {
  await browser.close();
});

async function run(id: string, fn: (page: import("@playwright/test").Page) => Promise<void>) {
  const dir = path.join(OUT, `.vid-${id}`);
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  let err: unknown;
  try {
    await fn(page);
  } catch (e) {
    err = e;
  }
  await page.screenshot({ path: path.join(OUT, `${id}.png`) });
  const video = page.video();
  await context.close();
  if (err && video) fs.copyFileSync(await video.path(), path.join(OUT, `${id}.webm`));
  fs.rmSync(dir, { recursive: true, force: true });
  if (err) throw err;
}

async function addMug(page: import("@playwright/test").Page) {
  await page.goto(BASE + "/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("tc-102 add product to cart", async () => {
  await run("tc-102", async (page) => {
    await addMug(page);
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    console.log("TC-102 document.title:", await page.title());
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(lines).toHaveCount(1);
    await expect(lines.first()).toContainText("Stoneware mug");
    await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
  });
});

test("tc-103 change quantity 1 to 3", async () => {
  await run("tc-103", async (page) => {
    await addMug(page);
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const line = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
    const linePrice = (await line.locator(".line-price").innerText()).trim();
    const total = (await page.locator(".cart-summary strong").first().innerText()).trim();
    console.log(`TC-103 line=${linePrice} total=${total}`);
    expect(linePrice).toBe("$72.00");
    expect(total).toBe("$72.00");
  });
});
