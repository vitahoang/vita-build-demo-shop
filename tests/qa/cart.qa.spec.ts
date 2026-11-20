import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { addMugToCart, openCase, OUT } from "./helpers";

async function finish(id: string, ctx: Awaited<ReturnType<typeof openCase>>, failed: boolean) {
  const video = ctx.page.video();
  await ctx.context.close();
  if (failed && video) fs.copyFileSync(await video.path(), `${OUT}/${id}.webm`);
  await ctx.browser.close();
}

test("TC-102 Add product to cart", async () => {
  const id = "tc-102";
  const ctx = await openCase(id);
  const { page } = ctx;
  let failed = true;
  try {
    await addMugToCart(page);
    const cartLink = page.getByRole("link", { name: /^Cart, \d+ items?$/ });
    await expect(cartLink).toBeVisible();
    console.log("header cart link:", await cartLink.getAttribute("aria-label"), "| document.title:", await page.title());
    await cartLink.click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    await page.screenshot({ path: `${OUT}/${id}.png` });
    await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
    const rows = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByRole("link", { name: "Stoneware mug" })).toBeVisible();
    await expect(rows.first().locator(".line-price")).toHaveText("$24.00");
    failed = false;
  } finally {
    await finish(id, ctx, failed);
  }
});

test("TC-103 Change quantity 1 to 3", async () => {
  const id = "tc-103";
  const ctx = await openCase(id);
  const { page } = ctx;
  let failed = true;
  try {
    await addMugToCart(page);
    await page.getByRole("link", { name: /^Cart, \d+ items?$/ }).click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
    const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
    await inc.click();
    await inc.click();
    await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
    const row = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
    const linePrice = (await row.locator(".line-price").innerText()).trim();
    const total = (await page.locator(".cart-summary > div").first().locator("strong").innerText()).trim();
    console.log("line price:", linePrice, "| total:", total);
    await page.screenshot({ path: `${OUT}/${id}.png` });
    expect.soft(linePrice, "line price").toBe("$72.00");
    expect.soft(total, "Total").toBe("$72.00");
    failed = test.info().errors.length > 0;
  } finally {
    await finish(id, ctx, failed);
  }
});
