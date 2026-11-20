import { chromium, expect, test } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "https://vita-build-demo-shop.vercel.app";
const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

// adhoc-1: Cart total ignores quantity (issue #7)
test("adhoc-1: cart line price and total scale with quantity", async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: path.join(OUT, "video-tmp"), size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  let failed = false;
  try {
    await page.goto(BASE + "/");
    await page.getByRole("link", { name: /Stoneware mug/ }).click();
    await page.getByRole("button", { name: "Add to cart" }).click();
    await page.getByRole("link", { name: "Cart, 1 item" }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const unit = page.getByText("$24.00", { exact: true });
    console.log("with qty 1, $24.00 elements:", await unit.count());

    const qty = page.getByRole("spinbutton", { name: "Stoneware mug quantity" });
    await page.getByRole("button", { name: "Increase Stoneware mug quantity" }).click();
    await page.getByRole("button", { name: "Increase Stoneware mug quantity" }).click();
    await expect(qty).toHaveValue("3");
    await expect(page.getByRole("link", { name: "Cart, 3 items" })).toBeVisible();

    const cartText = await page.locator("main").innerText();
    console.log("cart text at qty 3:\n" + cartText);
    await page.screenshot({ path: path.join(OUT, "adhoc-1.png") });

    // Expected: 3 x $24.00 = $72.00 on the line and in the Total
    const total = page.getByText("Total", { exact: true }).locator("xpath=..");
    console.log("Total row text:", JSON.stringify(await total.innerText()));
    await expect(page.getByText("$72.00", { exact: true }).first()).toBeVisible({ timeout: 3000 }); // line price
    await expect(total).toContainText("$72.00");
  } catch (e) {
    failed = true;
    throw e;
  } finally {
    const video = page.video();
    await context.close();
    if (failed && video) await video.saveAs(path.join(OUT, "adhoc-1.webm"));
    fs.rmSync(path.join(OUT, "video-tmp"), { recursive: true, force: true });
    await browser.close();
  }
});
