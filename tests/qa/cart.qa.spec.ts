import { expect, test, type Browser } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

// Runs a case in its own context (ignoreHTTPSErrors for the sandbox proxy),
// records video, and keeps the video only when the case fails.
async function runCase(
  browser: Browser,
  id: string,
  body: (page: import("@playwright/test").Page) => Promise<void>,
) {
  fs.mkdirSync(OUT, { recursive: true });
  const tmp = path.join(OUT, `.video-${id}`);
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: tmp, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  const video = page.video();
  let failure: unknown;
  try {
    await body(page);
  } catch (e) {
    failure = e;
    await page.screenshot({ path: path.join(OUT, `${id}.png`) }).catch(() => {});
  }
  await context.close();
  if (failure && video) await video.saveAs(path.join(OUT, `${id}.webm`));
  fs.rmSync(tmp, { recursive: true, force: true });
  if (failure) throw failure;
}

async function addMug(page: import("@playwright/test").Page) {
  await page.goto(BASE + "/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("TC-102 Add product to cart", async ({ browser }) => {
  await runCase(browser, "tc-102", async (page) => {
    await addMug(page);
    const cartLink = page.getByRole("link", { name: /^Cart, \d+ items?$/ });
    await expect(cartLink).toHaveAttribute("aria-label", "Cart, 1 item");
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(lines).toHaveCount(1);
    await expect(lines.first().getByRole("link", { name: "Stoneware mug" })).toBeVisible();
    await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
    // Page title (document title) as observed
    console.log("TC-102 document.title =", JSON.stringify(await page.title()));
    await page.screenshot({ path: path.join(OUT, "tc-102.png") });
  });
});

test("TC-103 Change cart quantity 1 to 3", async ({ browser }) => {
  await runCase(browser, "tc-103", async (page) => {
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
    console.log(`TC-103 line price = ${linePrice}, total = ${total}`);
    await page.screenshot({ path: path.join(OUT, "tc-103.png") });
    expect(linePrice).toBe("$72.00");
    expect(total).toBe("$72.00");
  });
});
