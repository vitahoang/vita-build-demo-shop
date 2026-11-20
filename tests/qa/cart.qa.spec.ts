import { expect, test, chromium } from "@playwright/test";
import fs from "node:fs";

const BASE = process.env.TARGET_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.OUT_DIR ?? "/mnt/session/outputs";

async function run(id: string, body: (page: import("@playwright/test").Page) => Promise<void>) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    recordVideo: { dir: `/tmp/vid-${id}`, size: { width: 1280, height: 720 } },
    viewport: { width: 1280, height: 720 },
  });
  const page = await context.newPage();
  const video = page.video();
  let failed = false;
  try {
    await body(page);
  } catch (e) {
    failed = true;
    await page.screenshot({ path: `${OUT}/${id}.png`, fullPage: true });
    throw e;
  } finally {
    await context.close();
    if (failed && video) await video.saveAs(`${OUT}/${id}.webm`);
    await browser.close();
  }
}

async function addMug(page: import("@playwright/test").Page) {
  await page.goto(BASE + "/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("TC-102 add product to cart", async () => {
  await run("tc-102", async (page) => {
    await addMug(page);
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(lines).toHaveCount(1);
    await expect(lines.first()).toContainText("Stoneware mug");
    console.log("TC-102 document.title:", await page.title());
    console.log("TC-102 line text:", await lines.first().innerText());
    await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
    await page.screenshot({ path: `${OUT}/tc-102.png`, fullPage: true });
  });
});

test("TC-103 change quantity 1 to 3", async () => {
  await run("tc-103", async (page) => {
    await addMug(page);
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const line = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
    const linePrice = (await line.locator(".line-price").innerText()).trim();
    const total = (await page.locator(".cart-summary > div").first().locator("strong").innerText()).trim();
    console.log(`TC-103 line=${linePrice} total=${total}`);
    fs.writeFileSync("/tmp/tc103.txt", `line=${linePrice} total=${total}`);
    await page.screenshot({ path: `${OUT}/tc-103.png`, fullPage: true });
    expect(linePrice).toBe("$72.00");
    expect(total).toBe("$72.00");
  });
});
