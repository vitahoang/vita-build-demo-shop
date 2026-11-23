import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";

const OUT = process.env.QA_OUT ?? "/mnt/session/outputs";

test.use({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 720 } });

async function addMug(page: Page) {
  await page.goto("/");
  await page.getByRole("link", { name: /Stoneware mug/ }).click();
  await expect(page.getByRole("heading", { name: "Stoneware mug" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
}

test("TC-102: Thêm sản phẩm vào giỏ hàng", async ({ page }) => {
  await addMug(page);
  const cartLink = page.getByRole("link", { name: /^Cart/ });
  await expect(cartLink).toBeVisible();
  console.log("TC-102 header cart link:", await cartLink.getAttribute("aria-label"), "| document.title:", await page.title());
  await page.screenshot({ path: `${OUT}/tc-102-product.png` });
  await cartLink.click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  const lines = page.getByRole("list", { name: "Cart items" }).getByRole("listitem");
  await page.screenshot({ path: `${OUT}/tc-102.png` });
  await expect(page.getByRole("link", { name: "Cart, 1 item" })).toBeVisible();
  await expect(lines).toHaveCount(1);
  await expect(lines.first()).toContainText("Stoneware mug");
  await expect(lines.first().locator(".line-price")).toHaveText("$24.00");
});

test("TC-103: Đổi số lượng trong giỏ hàng từ 1 lên 3", async ({ page }) => {
  await addMug(page);
  await page.getByRole("link", { name: /^Cart/ }).click();
  await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();
  const inc = page.getByRole("button", { name: "Increase Stoneware mug quantity" });
  await inc.click();
  await inc.click();
  await expect(page.getByRole("spinbutton", { name: "Stoneware mug quantity" })).toHaveValue("3");
  const line = page.getByRole("list", { name: "Cart items" }).getByRole("listitem").first();
  const linePrice = (await line.locator(".line-price").innerText()).trim();
  const total = (await page.locator(".cart-summary strong").first().innerText()).trim();
  console.log(`TC-103 line price=${linePrice} total=${total}`);
  await page.screenshot({ path: `${OUT}/tc-103.png` });
  expect(linePrice).toBe("$72.00");
  expect(total).toBe("$72.00");
});
